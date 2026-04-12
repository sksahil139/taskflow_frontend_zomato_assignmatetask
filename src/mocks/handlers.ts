import { http, HttpResponse } from "msw";
import { getDb, saveDb } from "./db";
import {
  createToken,
  forbidden,
  getUserFromAuthHeader,
  jsonDelay,
  notFound,
  unauthorized,
  validationError,
} from "./utils";

const BASE_URL = "http://localhost:4000";

function sanitizeUser(user: { id: string; name: string; email: string }) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

export const handlers = [
  http.post(`${BASE_URL}/auth/register`, async ({ request }) => {
    await jsonDelay();

    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
    };

    const fields: Record<string, string> = {};
    if (!body.name?.trim()) fields.name = "is required";
    if (!body.email?.trim()) fields.email = "is required";
    if (!body.password?.trim()) fields.password = "is required";

    if (Object.keys(fields).length > 0) {
      return validationError(fields);
    }

    const name = body.name!.trim();
    const email = body.email!.trim();
    const password = body.password!;

    const db = getDb();
    const existingUser = db.users.find((u) => u.email === email);

    if (existingUser) {
      return validationError({ email: "already exists" });
    }

    const newUser = {
      id: `user-${crypto.randomUUID()}`,
      name,
      email,
      password,
    };

    db.users.push(newUser);
    saveDb(db);

    return HttpResponse.json(
      {
        token: createToken(newUser),
        user: sanitizeUser(newUser),
      },
      { status: 201 },
    );
  }),

  http.post(`${BASE_URL}/auth/login`, async ({ request }) => {
    await jsonDelay();

    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const fields: Record<string, string> = {};
    if (!body.email?.trim()) fields.email = "is required";
    if (!body.password?.trim()) fields.password = "is required";

    if (Object.keys(fields).length > 0) {
      return validationError(fields);
    }

    const email = body.email!.trim();
    const password = body.password!;

    const db = getDb();
    const user = db.users.find(
      (u) => u.email === email && u.password === password,
    );

    if (!user) {
      return HttpResponse.json(
        { error: "invalid credentials" },
        { status: 401 },
      );
    }

    return HttpResponse.json({
      token: createToken(user),
      user: sanitizeUser(user),
    });
  }),

  http.get(`${BASE_URL}/projects`, async ({ request }) => {
    await jsonDelay();

    const auth = getUserFromAuthHeader(request.headers.get("authorization"));
    if (!auth) return unauthorized();

    const db = getDb();

    const assignedProjectIds = new Set(
      db.tasks
        .filter((task) => task.assignee_id === auth.userId)
        .map((task) => task.project_id),
    );

    const projects = db.projects.filter(
      (project) =>
        project.owner_id === auth.userId || assignedProjectIds.has(project.id),
    );

    return HttpResponse.json({ projects });
  }),

  http.post(`${BASE_URL}/projects`, async ({ request }) => {
    await jsonDelay();

    const auth = getUserFromAuthHeader(request.headers.get("authorization"));
    if (!auth) return unauthorized();

    const body = (await request.json()) as {
      name?: string;
      description?: string;
    };

    if (!body.name?.trim()) {
      return validationError({ name: "is required" });
    }

    const db = getDb();

    const project = {
      id: `project-${crypto.randomUUID()}`,
      name: body.name.trim(),
      description: body.description?.trim() || "",
      owner_id: auth.userId,
      created_at: new Date().toISOString(),
    };

    db.projects.push(project);
    saveDb(db);

    return HttpResponse.json(project, { status: 201 });
  }),

  http.get(`${BASE_URL}/projects/:id`, async ({ params, request }) => {
    await jsonDelay();

    const auth = getUserFromAuthHeader(request.headers.get("authorization"));
    if (!auth) return unauthorized();

    const db = getDb();
    const project = db.projects.find((p) => p.id === params.id);

    if (!project) return notFound();

    const hasAssignedTask = db.tasks.some(
      (task) =>
        task.project_id === project.id && task.assignee_id === auth.userId,
    );

    const canAccess = project.owner_id === auth.userId || hasAssignedTask;

    if (!canAccess) return forbidden();

    const tasks = db.tasks.filter((task) => task.project_id === project.id);

    return HttpResponse.json({
      ...project,
      tasks,
    });
  }),

  http.patch(`${BASE_URL}/projects/:id`, async ({ params, request }) => {
    await jsonDelay();

    const auth = getUserFromAuthHeader(request.headers.get("authorization"));
    if (!auth) return unauthorized();

    const body = (await request.json()) as {
      name?: string;
      description?: string;
    };

    const db = getDb();
    const project = db.projects.find((p) => p.id === params.id);

    if (!project) return notFound();
    if (project.owner_id !== auth.userId) return forbidden();

    if (body.name !== undefined && !body.name.trim()) {
      return validationError({ name: "is required" });
    }

    project.name = body.name?.trim() ?? project.name;
    project.description = body.description?.trim() ?? project.description;

    saveDb(db);

    return HttpResponse.json(project);
  }),

  http.delete(`${BASE_URL}/projects/:id`, async ({ params, request }) => {
    await jsonDelay();

    const auth = getUserFromAuthHeader(request.headers.get("authorization"));
    if (!auth) return unauthorized();

    const db = getDb();
    const project = db.projects.find((p) => p.id === params.id);

    if (!project) return notFound();
    if (project.owner_id !== auth.userId) return forbidden();

    db.projects = db.projects.filter((p) => p.id !== params.id);
    db.tasks = db.tasks.filter((task) => task.project_id !== params.id);
    saveDb(db);

    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${BASE_URL}/projects/:id/tasks`, async ({ params, request }) => {
    await jsonDelay();

    const auth = getUserFromAuthHeader(request.headers.get("authorization"));
    if (!auth) return unauthorized();

    const db = getDb();
    const project = db.projects.find((p) => p.id === params.id);

    if (!project) return notFound();

    const hasAssignedTask = db.tasks.some(
      (task) =>
        task.project_id === project.id && task.assignee_id === auth.userId,
    );

    const canAccess = project.owner_id === auth.userId || hasAssignedTask;

    if (!canAccess) return forbidden();

    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const assignee = url.searchParams.get("assignee");

    let tasks = db.tasks.filter((task) => task.project_id === params.id);

    if (status) {
      tasks = tasks.filter((task) => task.status === status);
    }

    if (assignee) {
      tasks = tasks.filter((task) => task.assignee_id === assignee);
    }

    return HttpResponse.json({ tasks });
  }),

  http.post(`${BASE_URL}/projects/:id/tasks`, async ({ params, request }) => {
    await jsonDelay();

    const auth = getUserFromAuthHeader(request.headers.get("authorization"));
    if (!auth) return unauthorized();

    const db = getDb();
    const project = db.projects.find((p) => p.id === params.id);

    if (!project) return notFound();

    const body = (await request.json()) as {
      title?: string;
      description?: string;
      priority?: "low" | "medium" | "high";
      assignee_id?: string | null;
      due_date?: string | null;
      status?: "todo" | "in_progress" | "done";
    };

    if (!body.title?.trim()) {
      return validationError({ title: "is required" });
    }

    const task = {
      id: `task-${crypto.randomUUID()}`,
      title: body.title.trim(),
      description: body.description?.trim() || "",
      status: body.status ?? "todo",
      priority: body.priority ?? "medium",
      project_id: params.id as string,
      assignee_id: body.assignee_id ?? null,
      due_date: body.due_date ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.tasks.push(task);
    saveDb(db);

    return HttpResponse.json(task, { status: 201 });
  }),

  http.patch(`${BASE_URL}/tasks/:id`, async ({ params, request }) => {
    await jsonDelay();

    const auth = getUserFromAuthHeader(request.headers.get("authorization"));
    if (!auth) return unauthorized();

    const db = getDb();
    const task = db.tasks.find((t) => t.id === params.id);

    if (!task) return notFound();

    const project = db.projects.find((p) => p.id === task.project_id);
    if (!project) return notFound();

    const body = (await request.json()) as Partial<typeof task>;

    if (body.title !== undefined && !body.title.trim()) {
      return validationError({ title: "is required" });
    }

    Object.assign(task, {
      ...body,
      title: body.title?.trim() ?? task.title,
      description: body.description?.trim() ?? task.description,
      updated_at: new Date().toISOString(),
    });

    saveDb(db);

    return HttpResponse.json(task);
  }),

  http.delete(`${BASE_URL}/tasks/:id`, async ({ params, request }) => {
    await jsonDelay();

    const auth = getUserFromAuthHeader(request.headers.get("authorization"));
    if (!auth) return unauthorized();

    const db = getDb();
    const task = db.tasks.find((t) => t.id === params.id);

    if (!task) return notFound();

    const project = db.projects.find((p) => p.id === task.project_id);
    if (!project) return notFound();

    const canDelete =
      project.owner_id === auth.userId || task.assignee_id === auth.userId;

    if (!canDelete) return forbidden();

    db.tasks = db.tasks.filter((t) => t.id !== params.id);
    saveDb(db);

    return new HttpResponse(null, { status: 204 });
  }),
];
