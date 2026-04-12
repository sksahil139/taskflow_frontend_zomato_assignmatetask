import type { User } from "@/features/auth/auth-types";
import type { Project } from "@/features/projects/projects-types";
import type { Task } from "@/features/tasks/task-types";

export interface MockUser extends User {
  password: string;
}

export const seedUsers: MockUser[] = [
  {
    id: "user-1",
    name: "Test User",
    email: "test@example.com",
    password: "password123",
  },
  {
    id: "user-2",
    name: "Jane Smith",
    email: "jane@example.com",
    password: "password123",
  },
];

export const seedProjects: Project[] = [
  {
    id: "project-1",
    name: "Website Redesign",
    description: "Q2 marketing refresh",
    owner_id: "user-1",
    created_at: "2026-04-01T10:00:00Z",
  },
  {
    id: "project-2",
    name: "Mobile App MVP",
    description: "Internal planning project",
    owner_id: "user-2",
    created_at: "2026-04-03T09:30:00Z",
  },
];

export const seedTasks: Task[] = [
  {
    id: "task-1",
    title: "Design homepage",
    description: "Create updated hero and layout",
    status: "in_progress",
    priority: "high",
    project_id: "project-1",
    assignee_id: "user-1",
    due_date: "2026-04-15",
    created_at: "2026-04-05T08:00:00Z",
    updated_at: "2026-04-07T10:00:00Z",
  },
  {
    id: "task-2",
    title: "Write copy",
    description: "Marketing copy for landing page",
    status: "todo",
    priority: "medium",
    project_id: "project-1",
    assignee_id: "user-2",
    due_date: "2026-04-18",
    created_at: "2026-04-05T09:00:00Z",
    updated_at: "2026-04-05T09:00:00Z",
  },
  {
    id: "task-3",
    title: "Prepare wireframes",
    description: "Low fidelity mobile app flows",
    status: "done",
    priority: "low",
    project_id: "project-2",
    assignee_id: "user-2",
    due_date: "2026-04-12",
    created_at: "2026-04-04T10:00:00Z",
    updated_at: "2026-04-10T14:00:00Z",
  },
];