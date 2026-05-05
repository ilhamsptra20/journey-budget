import type { ZodIssue } from "zod";

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly data: unknown = null,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ValidationApiError extends ApiError {
  constructor(errors: ZodIssue[] | unknown[]) {
    super(422, "Validation error", { errors });
    this.name = "ValidationApiError";
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "Data not found") {
    super(404, message);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized") {
    super(401, message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = "Forbidden") {
    super(403, message);
    this.name = "ForbiddenError";
  }
}
