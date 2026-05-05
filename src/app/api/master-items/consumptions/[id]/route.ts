import { NextRequest } from "next/server";

import { allowGuestReadOnly } from "@/core/auth/guard";
import { readJsonBody, resolveParams, withHandler } from "@/core/http/handler";
import { successResponse } from "@/core/http/response";
import { masterItemService } from "@/modules/master-items/masterItem.service";

export const PATCH = withHandler(async (request: NextRequest, context) => {
  allowGuestReadOnly(request);
  const { id } = await resolveParams<{ id: string }>(context);
  const body = await readJsonBody(request);
  const result = await masterItemService.updateConsumption(id, body);
  return successResponse(result.message, result.data);
});

export const DELETE = withHandler(async (request: NextRequest, context) => {
  allowGuestReadOnly(request);
  const { id } = await resolveParams<{ id: string }>(context);
  const result = await masterItemService.deleteConsumption(id);
  return successResponse(result.message, result.data);
});
