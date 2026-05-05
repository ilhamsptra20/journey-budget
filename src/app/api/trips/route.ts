import { NextRequest } from "next/server";

import { allowGuestReadOnly } from "@/core/auth/guard";
import { readJsonBody, withHandler } from "@/core/http/handler";
import { successResponse } from "@/core/http/response";
import { tripService } from "@/modules/trips/trip.service";

export const GET = withHandler(async (request: NextRequest) => {
  allowGuestReadOnly(request);
  const result = await tripService.list();
  return successResponse(result.message, result.data);
});

export const POST = withHandler(async (request: NextRequest) => {
  allowGuestReadOnly(request);
  const body = await readJsonBody(request);
  const result = await tripService.create(body);
  return successResponse(result.message, result.data, 201);
});
