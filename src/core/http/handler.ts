import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { ApiError, ValidationApiError } from "./errors";
import { errorResponse, validationErrorResponse } from "./response";

export type RouteParams = Record<string, string>;

export type RouteContext<TParams extends RouteParams = RouteParams> = {
  params?: TParams | Promise<TParams>;
};

export type RouteHandler<TParams extends RouteParams = RouteParams> = (
  request: NextRequest,
  context?: RouteContext<TParams>,
) => Promise<NextResponse>;

export function withHandler<TParams extends RouteParams = RouteParams>(
  handler: RouteHandler<TParams>,
): RouteHandler<TParams> {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      if (error instanceof ValidationApiError) {
        const errors =
          typeof error.data === "object" && error.data !== null && "errors" in error.data
            ? (error.data as { errors: unknown }).errors
            : [];
        return validationErrorResponse(errors);
      }

      if (error instanceof ZodError) {
        return validationErrorResponse(error.issues);
      }

      if (error instanceof ApiError) {
        return errorResponse(error.message, error.data, error.statusCode);
      }

      console.error(error);
      return errorResponse("Internal server error", null, 500);
    }
  };
}

export async function readJsonBody<T = unknown>(request: NextRequest): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new ApiError(400, "Invalid JSON body");
  }
}

export async function resolveParams<TParams extends RouteParams>(
  context?: RouteContext,
): Promise<TParams> {
  if (!context?.params) {
    return {} as unknown as TParams;
  }

  return (await context.params) as TParams;
}
