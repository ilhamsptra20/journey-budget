import { NextResponse } from "next/server";

export type ApiResponse<T = unknown> = {
  status: boolean;
  message: string;
  data: T;
};

export function successResponse<T>(
  message: string,
  data: T,
  statusCode = 200,
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      status: true,
      message,
      data,
    },
    { status: statusCode },
  );
}

export function errorResponse(
  message: string,
  data: unknown,
  statusCode = 400,
): NextResponse<ApiResponse<unknown>> {
  return NextResponse.json(
    {
      status: false,
      message,
      data,
    },
    { status: statusCode },
  );
}

export function validationErrorResponse(
  errors: unknown,
): NextResponse<ApiResponse<{ errors: unknown }>> {
  return NextResponse.json(
    {
      status: false,
      message: "Validation error",
      data: {
        errors,
      },
    },
    { status: 422 },
  );
}
