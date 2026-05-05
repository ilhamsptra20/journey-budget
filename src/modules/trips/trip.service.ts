import { NotFoundError, ValidationApiError } from "@/core/http/errors";

import { tripRepository } from "./trip.repository";
import {
  createTripSchema,
  updateTripSchema,
} from "./trip.validation";

class TripService {
  async list() {
    const rows = await tripRepository.findAll();
    return {
      message: "Trips fetched",
      data: rows,
    };
  }

  async create(input: unknown) {
    const parsed = createTripSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationApiError(parsed.error.issues);
    }

    const trip = await tripRepository.create({
      title: parsed.data.title,
      location: parsed.data.location,
      startDate: parsed.data.start_date,
      endDate: parsed.data.end_date ?? null,
    });

    return {
      message: "Trip created",
      data: trip,
    };
  }

  async detail(id: string) {
    const trip = await tripRepository.findById(id);
    if (!trip) {
      throw new NotFoundError("Trip not found");
    }

    return {
      message: "Trip fetched",
      data: trip,
    };
  }

  async update(id: string, input: unknown) {
    const parsed = updateTripSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationApiError(parsed.error.issues);
    }

    const existing = await tripRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Trip not found");
    }

    const mergedStartDate = parsed.data.start_date ?? existing.startDate;
    const mergedEndDate =
      parsed.data.end_date !== undefined ? parsed.data.end_date : existing.endDate;

    if (mergedEndDate && mergedStartDate > mergedEndDate) {
      throw new ValidationApiError([
        {
          code: "custom",
          message: "start_date cannot be after end_date",
          path: ["end_date"],
        },
      ]);
    }

    const trip = await tripRepository.update(id, {
      title: parsed.data.title,
      location: parsed.data.location,
      startDate: parsed.data.start_date,
      endDate: parsed.data.end_date,
    });

    if (!trip) {
      throw new NotFoundError("Trip not found");
    }

    return {
      message: "Trip updated",
      data: trip,
    };
  }

  async remove(id: string) {
    const deleted = await tripRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError("Trip not found");
    }

    return {
      message: "Trip deleted",
      data: deleted,
    };
  }
}

export const tripService = new TripService();
