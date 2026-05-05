import { NextRequest } from "next/server";

import { setAuthCookie } from "@/core/auth/jwt";
import { readJsonBody, withHandler } from "@/core/http/handler";
import { successResponse } from "@/core/http/response";
import { authService } from "@/modules/auth/auth.service";

export const POST = withHandler(async (request: NextRequest) => {
  const body = await readJsonBody(request);
  const result = await authService.login(body);

  const response = successResponse(result.message, result.data);
  setAuthCookie(response, result.token);

  return response;
});
