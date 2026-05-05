import { clearAuthCookie } from "@/core/auth/jwt";
import { withHandler } from "@/core/http/handler";
import { successResponse } from "@/core/http/response";
import { authService } from "@/modules/auth/auth.service";

export const POST = withHandler(async () => {
  const result = authService.logout();
  const response = successResponse(result.message, result.data);
  clearAuthCookie(response);

  return response;
});
