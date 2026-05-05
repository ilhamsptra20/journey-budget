import { ApiError, UnauthorizedError, ValidationApiError } from "@/core/http/errors";
import { hashPassword, verifyPassword } from "@/core/auth/password";
import { signAuthToken } from "@/core/auth/jwt";

import { authRepository } from "./auth.repository";
import { loginSchema, registerSchema } from "./auth.validation";

function sanitizeUser(user: {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "guest";
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.createdAt,
    updated_at: user.updatedAt,
  };
}

class AuthService {
  async register(input: unknown) {
    const parsed = registerSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationApiError(parsed.error.issues);
    }

    const existingUser = await authRepository.findByEmail(parsed.data.email);
    if (existingUser) {
      throw new ApiError(409, "Email already registered");
    }

    const hashedPassword = await hashPassword(parsed.data.password);

    const user = await authRepository.create({
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: hashedPassword,
      role: parsed.data.role,
    });

    const token = signAuthToken({
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    return {
      message: "Register success",
      data: {
        user: sanitizeUser(user),
      },
      token,
    };
  }

  async login(input: unknown) {
    const parsed = loginSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationApiError(parsed.error.issues);
    }

    const user = await authRepository.findByEmail(parsed.data.email);

    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const passwordMatch = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const token = signAuthToken({
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    return {
      message: "Login success",
      data: {
        user: sanitizeUser(user),
      },
      token,
    };
  }

  async me(userId: string) {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError("Invalid token");
    }

    return {
      message: "Current user",
      data: sanitizeUser(user),
    };
  }

  logout() {
    return {
      message: "Logout success",
      data: null,
    };
  }
}

export const authService = new AuthService();
