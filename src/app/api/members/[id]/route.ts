import { NextRequest } from "next/server";

import { allowGuestReadOnly } from "@/core/auth/guard";
import { readJsonBody, resolveParams, withHandler } from "@/core/http/handler";
import { successResponse } from "@/core/http/response";
import { memberService } from "@/modules/members/member.service";

export const GET = withHandler(async (request: NextRequest, context) => {
  allowGuestReadOnly(request);
  const { id } = await resolveParams<{ id: string }>(context);
  const result = await memberService.detail(id);
  return successResponse(result.message, result.data);
});

export const PATCH = withHandler(async (request: NextRequest, context) => {
  allowGuestReadOnly(request);
  const { id } = await resolveParams<{ id: string }>(context);
  const body = await readJsonBody(request);
  const result = await memberService.update(id, body);
  return successResponse(result.message, result.data);
});

export const DELETE = withHandler(async (request: NextRequest, context) => {
  allowGuestReadOnly(request);
  const { id } = await resolveParams<{ id: string }>(context);
  const result = await memberService.remove(id);
  return successResponse(result.message, result.data);
});
