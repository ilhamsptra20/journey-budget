import { NextRequest } from "next/server";

import { allowGuestReadOnly } from "@/core/auth/guard";
import { readJsonBody, resolveParams, withHandler } from "@/core/http/handler";
import { successResponse } from "@/core/http/response";
import { fundService } from "@/modules/funds/fund.service";

export const PATCH = withHandler(async (request: NextRequest, context) => {
  allowGuestReadOnly(request);
  const { tripId, id } = await resolveParams<{ tripId: string; id: string }>(context);
  const body = await readJsonBody(request);
  const result = await fundService.update(tripId, id, body);
  return successResponse(result.message, result.data);
});

export const DELETE = withHandler(async (request: NextRequest, context) => {
  allowGuestReadOnly(request);
  const { tripId, id } = await resolveParams<{ tripId: string; id: string }>(context);
  const result = await fundService.remove(tripId, id);
  return successResponse(result.message, result.data);
});
