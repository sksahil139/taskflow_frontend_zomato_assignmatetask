import type { TaskPriority, TaskStatus } from "@/types/common";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  project_id: string;
  assignee_id: string | null;
  due_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskListResponse {
  tasks: Task[];
}