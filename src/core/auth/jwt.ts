import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

import type { UserRole } from "@/infrastructure/db/schema";

export const AUTH_COOKIE_NAME = "trip_budgeting_token";

export type AuthTokenPayload = {
  sub: string;
  name: string;
  email: string;
  role: UserRole;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return secret;
}

export function signAuthToken(payload: AuthTokenPayload) {
  const expiresIn = (process.env.JWT_EXPIRES_IN ?? "7d") as jwt.SignOptions["expiresIn"];

  return jwt.sign(payload, getJwtSecret(), {
    expiresIn,
  });
}

export function verifyAuthToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret());

    if (typeof decoded === "string") {
      return null;
    }

    const sub = decoded.sub;
    const role = decoded.role;
    const name = decoded.name;
    const email = decoded.email;

    if (
      typeof sub !== "string" ||
      typeof role !== "string" ||
      typeof name !== "string" ||
      typeof email !== "string"
    ) {
      return null;
    }

    if (role !== "admin" && role !== "user" && role !== "guest") {
      return null;
    }

    return {
      id: sub,
      role,
      name,
      email,
    };
  } catch {
    return null;
  }
}

export function readAuthToken(request: NextRequest) {
  return request.cookies.get(AUTH_COOKIE_NAME)?.value ?? null;
}

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
