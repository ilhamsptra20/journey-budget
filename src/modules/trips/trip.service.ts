import { randomBytes } from "node:crypto";

import { NotFoundError, ValidationApiError } from "@/core/http/errors";
import type { Trip } from "@/infrastructure/db/schema";

import { tripRepository } from "./trip.repository";
import {
  createTripSchema,
  updateTripSchema,
} from "./trip.validation";

const PUBLIC_REPORT_TOKEN_BYTES = 24;
const MAX_TOKEN_RETRY = 8;

function mapTripResponse(trip: Trip) {
  return {
    id: trip.id,
    title: trip.title,
    location: trip.location,
    startDate: trip.startDate,
    endDate: trip.endDate,
    publicReportEnabled: trip.publicReportEnabled,
  };
}

function buildShareLink(token: string) {
  return `/report/${token}`;
}

class TripService {
  private async generateUniquePublicReportToken() {
    for (let attempt = 0; attempt < MAX_TOKEN_RETRY; attempt += 1) {
      const token = randomBytes(PUBLIC_REPORT_TOKEN_BYTES).toString("base64url");
      const exists = await tripRepository.findByPublicReportToken(token);
      if (!exists) {
        return token;
      }
    }

    throw new Error("Failed to generate unique public report token");
  }

  private async findTripOrThrow(tripId: string) {
    const trip = await tripRepository.findById(tripId);
    if (!trip) {
      throw new NotFoundError("Trip not found");
    }

    return trip;
  }

  async list() {
    const rows = await tripRepository.findAll();
    return {
      message: "Trips fetched",
      data: rows.map(mapTripResponse),
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
      data: mapTripResponse(trip),
    };
  }

  async detail(id: string) {
    const trip = await this.findTripOrThrow(id);

    return {
      message: "Trip fetched",
      data: mapTripResponse(trip),
    };
  }

  async update(id: string, input: unknown) {
    const parsed = updateTripSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationApiError(parsed.error.issues);
    }

    const existing = await this.findTripOrThrow(id);

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
      data: mapTripResponse(trip),
    };
  }

  async enablePublicReport(tripId: string) {
    const trip = await this.findTripOrThrow(tripId);
    const nextToken = trip.publicReportToken ?? (await this.generateUniquePublicReportToken());

    const updated = await tripRepository.updatePublicReport(tripId, {
      publicReportEnabled: true,
      publicReportToken: nextToken,
    });

    if (!updated) {
      throw new NotFoundError("Trip not found");
    }

    return {
      message: "Public report enabled",
      data: {
        public_report_enabled: updated.publicReportEnabled,
        public_report_token: updated.publicReportToken,
        share_link: updated.publicReportToken ? buildShareLink(updated.publicReportToken) : null,
      },
    };
  }

  async regeneratePublicReportToken(tripId: string) {
    await this.findTripOrThrow(tripId);
    const nextToken = await this.generateUniquePublicReportToken();

    const updated = await tripRepository.updatePublicReport(tripId, {
      publicReportEnabled: true,
      publicReportToken: nextToken,
    });

    if (!updated) {
      throw new NotFoundError("Trip not found");
    }

    return {
      message: "Public report token regenerated",
      data: {
        public_report_enabled: updated.publicReportEnabled,
        public_report_token: updated.publicReportToken,
        share_link: updated.publicReportToken ? buildShareLink(updated.publicReportToken) : null,
      },
    };
  }

  async disablePublicReport(tripId: string) {
    await this.findTripOrThrow(tripId);

    const updated = await tripRepository.updatePublicReport(tripId, {
      publicReportEnabled: false,
      publicReportToken: null,
    });

    if (!updated) {
      throw new NotFoundError("Trip not found");
    }

    return {
      message: "Public report disabled",
      data: {
        public_report_enabled: updated.publicReportEnabled,
        public_report_token: null,
        share_link: null,
      },
    };
  }

  async remove(id: string) {
    const deleted = await tripRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError("Trip not found");
    }

    return {
      message: "Trip deleted",
      data: mapTripResponse(deleted),
    };
  }
}

export const tripService = new TripService();
