import { NextRequest } from "next/server";

import { allowGuestReadOnly } from "@/core/auth/guard";
import { resolveParams, withHandler } from "@/core/http/handler";
import { successResponse } from "@/core/http/response";
import { tripService } from "@/modules/trips/trip.service";

export const POST = withHandler(async (request: NextRequest, context) => {
  allowGuestReadOnly(request);
  const { tripId } = await resolveParams<{ tripId: string }>(context);
  const result = await tripService.disablePublicReport(tripId);
  return successResponse(result.message, result.data);
});
