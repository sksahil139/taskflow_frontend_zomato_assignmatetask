import { apiClient } from "@/lib/api-client";
import type { User } from "./auth-types";

export interface UsersResponse {
  users: User[];
}

export function getUsers() {
  return apiClient<UsersResponse>("/users");
}