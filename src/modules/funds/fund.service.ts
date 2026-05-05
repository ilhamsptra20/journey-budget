import { NotFoundError, ValidationApiError } from "@/core/http/errors";

import { tripMemberRepository } from "@/modules/trip-members/tripMember.repository";
import { tripRepository } from "@/modules/trips/trip.repository";

import { fundRepository } from "./fund.repository";
import { createFundSchema, updateFundSchema } from "./fund.validation";

class FundService {
  private async ensureTripExists(tripId: string) {
    const trip = await tripRepository.findById(tripId);
    if (!trip) {
      throw new NotFoundError("Trip not found");
    }
  }

  private async ensureTripMember(tripId: string, memberId: string) {
    const memberIds = await tripMemberRepository.listMemberIdsByTripId(tripId);
    if (!memberIds.includes(memberId)) {
      throw new ValidationApiError([
        {
          code: "custom",
          message: "member_id must be a member of the trip",
          path: ["member_id"],
        },
      ]);
    }
  }

  async list(tripId: string) {
    await this.ensureTripExists(tripId);
    const rows = await fundRepository.findByTripId(tripId);

    return {
      message: "Funds fetched",
      data: rows,
    };
  }

  async create(tripId: string, input: unknown) {
    const parsed = createFundSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationApiError(parsed.error.issues);
    }

    await this.ensureTripExists(tripId);

    if (parsed.data.type === "kolektif" && parsed.data.member_id) {
      await this.ensureTripMember(tripId, parsed.data.member_id);
    }

    const row = await fundRepository.create(tripId, {
      type: parsed.data.type,
      memberId: parsed.data.member_id ?? null,
      sourceName: parsed.data.source_name ?? null,
      amount: parsed.data.amount,
      paidAt: parsed.data.paid_at ? new Date(parsed.data.paid_at) : null,
      method: parsed.data.method ?? null,
      note: parsed.data.note ?? null,
    });

    return {
      message: "Fund created",
      data: row,
    };
  }

  async update(tripId: string, id: string, input: unknown) {
    const parsed = updateFundSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationApiError(parsed.error.issues);
    }

    const existing = await fundRepository.findByIdInTrip(tripId, id);
    if (!existing) {
      throw new NotFoundError("Fund not found");
    }

    const mergedPayload = {
      type: parsed.data.type ?? existing.type,
      member_id:
        parsed.data.member_id !== undefined ? parsed.data.member_id : existing.memberId,
      source_name:
        parsed.data.source_name !== undefined
          ? parsed.data.source_name
          : existing.sourceName,
      amount: parsed.data.amount ?? existing.amount,
      paid_at:
        parsed.data.paid_at !== undefined
          ? parsed.data.paid_at
          : existing.paidAt
            ? existing.paidAt.toISOString()
            : null,
      method: parsed.data.method !== undefined ? parsed.data.method : existing.method,
      note: parsed.data.note !== undefined ? parsed.data.note : existing.note,
    };

    const validatedMerged = createFundSchema.safeParse(mergedPayload);
    if (!validatedMerged.success) {
      throw new ValidationApiError(validatedMerged.error.issues);
    }

    if (validatedMerged.data.type === "kolektif" && validatedMerged.data.member_id) {
      await this.ensureTripMember(tripId, validatedMerged.data.member_id);
    }

    const row = await fundRepository.update(tripId, id, {
      type: parsed.data.type,
      memberId: parsed.data.member_id,
      sourceName: parsed.data.source_name,
      amount: parsed.data.amount,
      paidAt:
        parsed.data.paid_at !== undefined
          ? parsed.data.paid_at
            ? new Date(parsed.data.paid_at)
            : null
          : undefined,
      method: parsed.data.method,
      note: parsed.data.note,
    });

    if (!row) {
      throw new NotFoundError("Fund not found");
    }

    return {
      message: "Fund updated",
      data: row,
    };
  }

  async remove(tripId: string, id: string) {
    const row = await fundRepository.delete(tripId, id);
    if (!row) {
      throw new NotFoundError("Fund not found");
    }

    return {
      message: "Fund deleted",
      data: row,
    };
  }
}

export const fundService = new FundService();
