import { NextRequest } from "next/server";

import { allowGuestReadOnly } from "@/core/auth/guard";
import { resolveParams, withHandler } from "@/core/http/handler";
import { successResponse } from "@/core/http/response";
import { summaryService } from "@/modules/summaries/summary.service";

export const GET = withHandler(async (request: NextRequest, context) => {
  allowGuestReadOnly(request);
  const { tripId } = await resolveParams<{ tripId: string }>(context);
  const result = await summaryService.getTripSummary(tripId);
  return successResponse(result.message, result.data);
});
