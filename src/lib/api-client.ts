import { getStoredToken } from "@/features/auth/auth-storage";
import type { ApiErrorResponse } from "@/types/api";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export class ApiError extends Error {
  status: number;
  fields?: Record<string, string>;

  constructor(message: string, status: number, fields?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

export async function apiClient<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();

  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorBody: ApiErrorResponse | null = null;

    try {
      errorBody = (await response.json()) as ApiErrorResponse;
    } catch {
      errorBody = null;
    }

    throw new ApiError(
      errorBody?.error || "Request failed",
      response.status,
      errorBody?.fields
    );
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}