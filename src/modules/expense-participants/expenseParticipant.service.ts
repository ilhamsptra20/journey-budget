import { ApiError, NotFoundError, ValidationApiError } from "@/core/http/errors";

import { tripMemberRepository } from "@/modules/trip-members/tripMember.repository";
import { tripAccommodationRepository } from "@/modules/trip-expenses/tripAccommodation.repository";
import { tripConsumptionRepository } from "@/modules/trip-expenses/tripConsumption.repository";
import { tripLogisticRepository } from "@/modules/trip-expenses/tripLogistic.repository";

import { expenseParticipantRepository } from "./expenseParticipant.repository";
import {
  createExpenseParticipantSchema,
  listExpenseParticipantSchema,
  type ExpenseTypeInput,
} from "./expenseParticipant.validation";

type ExpenseContext = {
  tripId: string;
  scope: "group" | "personal";
};

class ExpenseParticipantService {
  private async resolveExpenseContext(
    expenseType: ExpenseTypeInput,
    expenseId: string,
  ): Promise<ExpenseContext> {
    if (expenseType === "trip_logistics") {
      const row = await tripLogisticRepository.findById(expenseId);
      if (!row) {
        throw new NotFoundError("Trip logistic expense not found");
      }

      return {
        tripId: row.tripId,
        scope: row.scope,
      };
    }

    if (expenseType === "trip_consumptions") {
      const row = await tripConsumptionRepository.findById(expenseId);
      if (!row) {
        throw new NotFoundError("Trip consumption expense not found");
      }

      return {
        tripId: row.tripId,
        scope: row.scope,
      };
    }

    const row = await tripAccommodationRepository.findById(expenseId);
    if (!row) {
      throw new NotFoundError("Trip accommodation expense not found");
    }

    return {
      tripId: row.tripId,
      scope: row.scope,
    };
  }

  async list(input: unknown) {
    const parsed = listExpenseParticipantSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationApiError(parsed.error.issues);
    }

    const rows = await expenseParticipantRepository.findByExpense(
      parsed.data.expenseType,
      parsed.data.expenseId,
    );

    return {
      message: "Expense participants fetched",
      data: rows,
    };
  }

  async create(input: unknown) {
    const parsed = createExpenseParticipantSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationApiError(parsed.error.issues);
    }

    const context = await this.resolveExpenseContext(
      parsed.data.expense_type,
      parsed.data.expense_id,
    );

    const tripMemberIds = new Set(
      await tripMemberRepository.listMemberIdsByTripId(context.tripId),
    );

    const invalidMembers = parsed.data.member_ids.filter((memberId) => !tripMemberIds.has(memberId));

    if (invalidMembers.length > 0) {
      throw new ValidationApiError([
        {
          code: "custom",
          message: "All member_ids must be registered in the trip",
          path: ["member_ids"],
        },
      ]);
    }

    const uniqueMemberIds = [...new Set(parsed.data.member_ids)];
    if (context.scope === "personal" && uniqueMemberIds.length === 0) {
      throw new ValidationApiError([
        {
          code: "custom",
          message: "Participants are required for personal scope",
          path: ["member_ids"],
        },
      ]);
    }

    const existingMemberIds = new Set(
      await expenseParticipantRepository.findMemberIdsByExpense(
        parsed.data.expense_type,
        parsed.data.expense_id,
      ),
    );

    const insertMemberIds = uniqueMemberIds.filter((memberId) => !existingMemberIds.has(memberId));

    if (insertMemberIds.length === 0) {
      throw new ApiError(409, "All participants already exist for this expense");
    }

    const rows = await expenseParticipantRepository.createMany(
      parsed.data.expense_type,
      parsed.data.expense_id,
      insertMemberIds,
    );

    return {
      message: "Expense participants created",
      data: rows,
    };
  }

  async remove(id: string) {
    const row = await expenseParticipantRepository.deleteById(id);
    if (!row) {
      throw new NotFoundError("Expense participant not found");
    }

    return {
      message: "Expense participant deleted",
      data: row,
    };
  }
}

export const expenseParticipantService = new ExpenseParticipantService();
