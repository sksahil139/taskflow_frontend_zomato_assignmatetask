import { apiClient } from "@/lib/api-client";
import type {
  CreateTaskInput,
  Task,
  TaskListResponse,
  UpdateTaskInput,
} from "./task-types";

interface GetProjectTasksParams {
  projectId: string;
  status?: string;
  assignee?: string;
}

export function getProjectTasks(params: GetProjectTasksParams) {
  const searchParams = new URLSearchParams();

  if (params.status) {
    searchParams.set("status", params.status);
  }

  if (params.assignee) {
    searchParams.set("assignee", params.assignee);
  }

  const query = searchParams.toString();
  const path = query
    ? `/projects/${params.projectId}/tasks?${query}`
    : `/projects/${params.projectId}/tasks`;

  return apiClient<TaskListResponse>(path);
}

export function createTask(projectId: string, payload: CreateTaskInput) {
  return apiClient<Task>(`/projects/${projectId}/tasks`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateTask(taskId: string, payload: UpdateTaskInput) {
  return apiClient<Task>(`/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}