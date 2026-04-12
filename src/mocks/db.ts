import { seedProjects, seedTasks, seedUsers, type MockUser } from "./data";
import type { Project } from "@/features/projects/projects-types";
import type { Task } from "@/features/tasks/task-types";

const DB_KEY = "taskflow-mock-db";

interface MockDatabase {
  users: MockUser[];
  projects: Project[];
  tasks: Task[];
}

function createSeedDb(): MockDatabase {
  return {
    users: [...seedUsers],
    projects: [...seedProjects],
    tasks: [...seedTasks],
  };
}

export function getDb(): MockDatabase {
  const raw = localStorage.getItem(DB_KEY);

  if (!raw) {
    const initialDb = createSeedDb();
    localStorage.setItem(DB_KEY, JSON.stringify(initialDb));
    return initialDb;
  }

  try {
    return JSON.parse(raw) as MockDatabase;
  } catch {
    const initialDb = createSeedDb();
    localStorage.setItem(DB_KEY, JSON.stringify(initialDb));
    return initialDb;
  }
}

export function saveDb(db: MockDatabase) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

export function resetDb() {
  localStorage.setItem(DB_KEY, JSON.stringify(createSeedDb()));
}