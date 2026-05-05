import { NextRequest } from "next/server";

import { allowGuestReadOnly } from "@/core/auth/guard";
import { resolveParams, withHandler } from "@/core/http/handler";
import { successResponse } from "@/core/http/response";
import { expenseParticipantService } from "@/modules/expense-participants/expenseParticipant.service";

export const DELETE = withHandler(async (request: NextRequest, context) => {
  allowGuestReadOnly(request);
  const { id } = await resolveParams<{ id: string }>(context);
  const result = await expenseParticipantService.remove(id);
  return successResponse(result.message, result.data);
});
