import { HttpResponse } from "msw";
import type { MockUser } from "./data";

export function jsonDelay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createToken(user: Pick<MockUser, "id" | "email">) {
  return `mock-jwt-token-${user.id}-${user.email}`;
}

export function getUserFromAuthHeader(authHeader: string | null | undefined) {
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.replace("Bearer ", "");
  if (!token.startsWith("mock-jwt-token-")) return null;

  const parts = token.replace("mock-jwt-token-", "").split("-");
  const userId = parts[0] === "user" ? `${parts[0]}-${parts[1]}` : parts[0];

  return { userId, token };
}

export function unauthorized() {
  return HttpResponse.json({ error: "unauthorized" }, { status: 401 });
}

export function forbidden() {
  return HttpResponse.json({ error: "forbidden" }, { status: 403 });
}

export function notFound() {
  return HttpResponse.json({ error: "not found" }, { status: 404 });
}

export function validationError(fields: Record<string, string>) {
  return HttpResponse.json(
    { error: "validation failed", fields },
    { status: 400 }
  );
}