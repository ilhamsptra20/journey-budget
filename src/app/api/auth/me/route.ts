import { NextRequest } from "next/server";

import { requireAuth } from "@/core/auth/guard";
import { withHandler } from "@/core/http/handler";
import { successResponse } from "@/core/http/response";
import { authService } from "@/modules/auth/auth.service";

export const GET = withHandler(async (request: NextRequest) => {
  const user = requireAuth(request);
  const result = await authService.me(user.id);
  return successResponse(result.message, result.data);
});
