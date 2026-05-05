import { NextRequest } from "next/server";

import { allowGuestReadOnly } from "@/core/auth/guard";
import { readJsonBody, resolveParams, withHandler } from "@/core/http/handler";
import { successResponse } from "@/core/http/response";
import { tripExpenseService } from "@/modules/trip-expenses/tripExpense.service";

export const GET = withHandler(async (request: NextRequest, context) => {
  allowGuestReadOnly(request);
  const { tripId } = await resolveParams<{ tripId: string }>(context);
  const result = await tripExpenseService.listLogistics(tripId);
  return successResponse(result.message, result.data);
});

export const POST = withHandler(async (request: NextRequest, context) => {
  allowGuestReadOnly(request);
  const { tripId } = await resolveParams<{ tripId: string }>(context);
  const body = await readJsonBody(request);
  const result = await tripExpenseService.createLogistic(tripId, body);
  return successResponse(result.message, result.data, 201);
});
