import { NextRequest } from "next/server";

import { ForbiddenError, UnauthorizedError } from "@/core/http/errors";
import type { UserRole } from "@/infrastructure/db/schema";

import { readAuthToken, verifyAuthToken, type AuthUser } from "./jwt";

export function getAuthUser(request: NextRequest): AuthUser | null {
  const token = readAuthToken(request);
  if (!token) {
    return null;
  }

  return verifyAuthToken(token);
}

export function requireAuth(request: NextRequest): AuthUser {
  const user = getAuthUser(request);

  if (!user) {
    throw new UnauthorizedError("Login required");
  }

  return user;
}

export function requireRole(
  request: NextRequest,
  allowedRoles: UserRole[],
): AuthUser {
  const user = requireAuth(request);

  if (!allowedRoles.includes(user.role)) {
    throw new ForbiddenError("You do not have permission for this action");
  }

  return user;
}

export function allowGuestReadOnly(request: NextRequest): AuthUser {
  const method = request.method.toUpperCase();
  const authUser = getAuthUser(request);

  if (method === "GET") {
    return (
      authUser ?? {
        id: "guest",
        name: "Guest",
        email: "guest@local",
        role: "guest",
      }
    );
  }

  if (!authUser) {
    throw new UnauthorizedError("Login required");
  }

  if (authUser.role === "guest") {
    throw new ForbiddenError("Guest role can only access read endpoints");
  }

  return authUser;
}
