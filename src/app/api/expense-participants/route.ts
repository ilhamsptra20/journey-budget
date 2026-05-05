import { NextRequest } from "next/server";

import { allowGuestReadOnly } from "@/core/auth/guard";
import { readJsonBody, withHandler } from "@/core/http/handler";
import { successResponse } from "@/core/http/response";
import { expenseParticipantService } from "@/modules/expense-participants/expenseParticipant.service";

export const GET = withHandler(async (request: NextRequest) => {
  allowGuestReadOnly(request);

  const expenseType = request.nextUrl.searchParams.get("expenseType");
  const expenseId = request.nextUrl.searchParams.get("expenseId");

  const result = await expenseParticipantService.list({
    expenseType: expenseType ?? "",
    expenseId: expenseId ?? "",
  });

  return successResponse(result.message, result.data);
});

export const POST = withHandler(async (request: NextRequest) => {
  allowGuestReadOnly(request);
  const body = await readJsonBody(request);
  const result = await expenseParticipantService.create(body);
  return successResponse(result.message, result.data, 201);
});
