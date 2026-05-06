import { withHandler, resolveParams } from "@/core/http/handler";
import { successResponse } from "@/core/http/response";
import { summaryService } from "@/modules/summaries/summary.service";

export const GET = withHandler(async (_request, context) => {
  const { token } = await resolveParams<{ token: string }>(context);
  const result = await summaryService.getPublicReportByToken(token);
  return successResponse(result.message, result.data);
});
