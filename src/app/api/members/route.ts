import { NextRequest } from "next/server";

import { allowGuestReadOnly } from "@/core/auth/guard";
import { readJsonBody, withHandler } from "@/core/http/handler";
import { successResponse } from "@/core/http/response";
import { memberService } from "@/modules/members/member.service";

export const GET = withHandler(async (request: NextRequest) => {
  allowGuestReadOnly(request);
  const result = await memberService.list();
  return successResponse(result.message, result.data);
});

export const POST = withHandler(async (request: NextRequest) => {
  allowGuestReadOnly(request);
  const body = await readJsonBody(request);
  const result = await memberService.create(body);
  return successResponse(result.message, result.data, 201);
});
