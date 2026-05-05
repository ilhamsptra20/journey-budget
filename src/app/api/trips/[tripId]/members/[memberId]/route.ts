import { NextRequest } from "next/server";

import { allowGuestReadOnly } from "@/core/auth/guard";
import { resolveParams, withHandler } from "@/core/http/handler";
import { successResponse } from "@/core/http/response";
import { tripMemberService } from "@/modules/trip-members/tripMember.service";

export const DELETE = withHandler(async (request: NextRequest, context) => {
  allowGuestReadOnly(request);
  const { tripId, memberId } = await resolveParams<{
    tripId: string;
    memberId: string;
  }>(context);

  const result = await tripMemberService.remove(tripId, memberId);
  return successResponse(result.message, result.data);
});
