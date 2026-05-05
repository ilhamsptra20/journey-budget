import { ApiError, NotFoundError, ValidationApiError } from "@/core/http/errors";

import { memberRepository } from "@/modules/members/member.repository";
import { tripRepository } from "@/modules/trips/trip.repository";

import { tripMemberRepository } from "./tripMember.repository";
import { addTripMemberSchema } from "./tripMember.validation";

class TripMemberService {
  async list(tripId: string) {
    const trip = await tripRepository.findById(tripId);
    if (!trip) {
      throw new NotFoundError("Trip not found");
    }

    const rows = await tripMemberRepository.listByTripId(tripId);

    return {
      message: "Trip members fetched",
      data: rows,
    };
  }

  async add(tripId: string, input: unknown) {
    const parsed = addTripMemberSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationApiError(parsed.error.issues);
    }

    const trip = await tripRepository.findById(tripId);
    if (!trip) {
      throw new NotFoundError("Trip not found");
    }

    const member = await memberRepository.findById(parsed.data.member_id);
    if (!member) {
      throw new NotFoundError("Member not found");
    }

    const existing = await tripMemberRepository.findByTripAndMember(
      tripId,
      parsed.data.member_id,
    );
    if (existing) {
      throw new ApiError(409, "Member already exists in this trip");
    }

    const row = await tripMemberRepository.create(tripId, parsed.data.member_id);

    return {
      message: "Trip member added",
      data: row,
    };
  }

  async remove(tripId: string, memberId: string) {
    const deleted = await tripMemberRepository.deleteByTripAndMember(tripId, memberId);
    if (!deleted) {
      throw new NotFoundError("Trip member not found");
    }

    return {
      message: "Trip member removed",
      data: deleted,
    };
  }
}

export const tripMemberService = new TripMemberService();
