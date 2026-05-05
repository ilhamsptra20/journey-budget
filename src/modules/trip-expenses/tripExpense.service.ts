import { NotFoundError, ValidationApiError } from "@/core/http/errors";

import { accommodationItemRepository } from "@/modules/master-items/accommodationItem.repository";
import { consumptionItemRepository } from "@/modules/master-items/consumptionItem.repository";
import { logisticItemRepository } from "@/modules/master-items/logisticItem.repository";
import { tripRepository } from "@/modules/trips/trip.repository";

import { tripAccommodationRepository } from "./tripAccommodation.repository";
import { tripConsumptionRepository } from "./tripConsumption.repository";
import { tripLogisticRepository } from "./tripLogistic.repository";
import {
  createTripAccommodationSchema,
  createTripConsumptionSchema,
  createTripLogisticSchema,
  updateTripAccommodationSchema,
  updateTripConsumptionSchema,
  updateTripLogisticSchema,
} from "./tripExpense.validation";

class TripExpenseService {
  private async ensureTripExists(tripId: string) {
    const trip = await tripRepository.findById(tripId);
    if (!trip) {
      throw new NotFoundError("Trip not found");
    }
  }

  async listLogistics(tripId: string) {
    await this.ensureTripExists(tripId);
    const rows = await tripLogisticRepository.findByTripId(tripId);

    return {
      message: "Trip logistics fetched",
      data: rows,
    };
  }

  async createLogistic(tripId: string, input: unknown) {
    const parsed = createTripLogisticSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationApiError(parsed.error.issues);
    }

    await this.ensureTripExists(tripId);

    const masterItem = await logisticItemRepository.findById(parsed.data.logistic_item_id);
    if (!masterItem) {
      throw new NotFoundError("Logistic master item not found");
    }

    const row = await tripLogisticRepository.create(tripId, {
      logisticItemId: parsed.data.logistic_item_id,
      acquisitionType: parsed.data.acquisition_type,
      scope: parsed.data.scope,
      costType: parsed.data.cost_type,
      price: parsed.data.price ?? null,
      count: parsed.data.count,
      duration: parsed.data.duration ?? null,
    });

    return {
      message: "Trip logistic expense created",
      data: row,
    };
  }

  async updateLogistic(tripId: string, id: string, input: unknown) {
    const parsed = updateTripLogisticSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationApiError(parsed.error.issues);
    }

    const existing = await tripLogisticRepository.findByIdInTrip(tripId, id);
    if (!existing) {
      throw new NotFoundError("Trip logistic expense not found");
    }

    const mergedPayload = {
      logistic_item_id: parsed.data.logistic_item_id ?? existing.logisticItemId,
      acquisition_type: parsed.data.acquisition_type ?? existing.acquisitionType,
      scope: parsed.data.scope ?? existing.scope,
      cost_type: parsed.data.cost_type ?? existing.costType,
      price: parsed.data.price !== undefined ? parsed.data.price : existing.price,
      count: parsed.data.count ?? existing.count,
      duration: parsed.data.duration !== undefined ? parsed.data.duration : existing.duration,
    };

    const validatedMerged = createTripLogisticSchema.safeParse(mergedPayload);
    if (!validatedMerged.success) {
      throw new ValidationApiError(validatedMerged.error.issues);
    }

    if (parsed.data.logistic_item_id) {
      const masterItem = await logisticItemRepository.findById(parsed.data.logistic_item_id);
      if (!masterItem) {
        throw new NotFoundError("Logistic master item not found");
      }
    }

    const row = await tripLogisticRepository.update(tripId, id, {
      logisticItemId: parsed.data.logistic_item_id,
      acquisitionType: parsed.data.acquisition_type,
      scope: parsed.data.scope,
      costType: parsed.data.cost_type,
      price: parsed.data.price,
      count: parsed.data.count,
      duration: parsed.data.duration,
    });

    if (!row) {
      throw new NotFoundError("Trip logistic expense not found");
    }

    return {
      message: "Trip logistic expense updated",
      data: row,
    };
  }

  async deleteLogistic(tripId: string, id: string) {
    const row = await tripLogisticRepository.delete(tripId, id);
    if (!row) {
      throw new NotFoundError("Trip logistic expense not found");
    }

    return {
      message: "Trip logistic expense deleted",
      data: row,
    };
  }

  async listConsumptions(tripId: string) {
    await this.ensureTripExists(tripId);
    const rows = await tripConsumptionRepository.findByTripId(tripId);

    return {
      message: "Trip consumptions fetched",
      data: rows,
    };
  }

  async createConsumption(tripId: string, input: unknown) {
    const parsed = createTripConsumptionSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationApiError(parsed.error.issues);
    }

    await this.ensureTripExists(tripId);

    const masterItem = await consumptionItemRepository.findById(parsed.data.consumption_item_id);
    if (!masterItem) {
      throw new NotFoundError("Consumption master item not found");
    }

    const row = await tripConsumptionRepository.create(tripId, {
      consumptionItemId: parsed.data.consumption_item_id,
      time: parsed.data.time,
      scope: parsed.data.scope,
      price: parsed.data.price,
      count: parsed.data.count,
    });

    return {
      message: "Trip consumption expense created",
      data: row,
    };
  }

  async updateConsumption(tripId: string, id: string, input: unknown) {
    const parsed = updateTripConsumptionSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationApiError(parsed.error.issues);
    }

    const existing = await tripConsumptionRepository.findByIdInTrip(tripId, id);
    if (!existing) {
      throw new NotFoundError("Trip consumption expense not found");
    }

    if (parsed.data.consumption_item_id) {
      const masterItem = await consumptionItemRepository.findById(parsed.data.consumption_item_id);
      if (!masterItem) {
        throw new NotFoundError("Consumption master item not found");
      }
    }

    const row = await tripConsumptionRepository.update(tripId, id, {
      consumptionItemId: parsed.data.consumption_item_id,
      time: parsed.data.time,
      scope: parsed.data.scope,
      price: parsed.data.price,
      count: parsed.data.count,
    });

    if (!row) {
      throw new NotFoundError("Trip consumption expense not found");
    }

    return {
      message: "Trip consumption expense updated",
      data: row,
    };
  }

  async deleteConsumption(tripId: string, id: string) {
    const row = await tripConsumptionRepository.delete(tripId, id);
    if (!row) {
      throw new NotFoundError("Trip consumption expense not found");
    }

    return {
      message: "Trip consumption expense deleted",
      data: row,
    };
  }

  async listAccommodations(tripId: string) {
    await this.ensureTripExists(tripId);
    const rows = await tripAccommodationRepository.findByTripId(tripId);

    return {
      message: "Trip accommodations fetched",
      data: rows,
    };
  }

  async createAccommodation(tripId: string, input: unknown) {
    const parsed = createTripAccommodationSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationApiError(parsed.error.issues);
    }

    await this.ensureTripExists(tripId);

    const masterItem = await accommodationItemRepository.findById(parsed.data.accommodation_item_id);
    if (!masterItem) {
      throw new NotFoundError("Accommodation master item not found");
    }

    const row = await tripAccommodationRepository.create(tripId, {
      accommodationItemId: parsed.data.accommodation_item_id,
      scope: parsed.data.scope,
      price: parsed.data.price,
      count: parsed.data.count,
    });

    return {
      message: "Trip accommodation expense created",
      data: row,
    };
  }

  async updateAccommodation(tripId: string, id: string, input: unknown) {
    const parsed = updateTripAccommodationSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationApiError(parsed.error.issues);
    }

    const existing = await tripAccommodationRepository.findByIdInTrip(tripId, id);
    if (!existing) {
      throw new NotFoundError("Trip accommodation expense not found");
    }

    if (parsed.data.accommodation_item_id) {
      const masterItem = await accommodationItemRepository.findById(parsed.data.accommodation_item_id);
      if (!masterItem) {
        throw new NotFoundError("Accommodation master item not found");
      }
    }

    const row = await tripAccommodationRepository.update(tripId, id, {
      accommodationItemId: parsed.data.accommodation_item_id,
      scope: parsed.data.scope,
      price: parsed.data.price,
      count: parsed.data.count,
    });

    if (!row) {
      throw new NotFoundError("Trip accommodation expense not found");
    }

    return {
      message: "Trip accommodation expense updated",
      data: row,
    };
  }

  async deleteAccommodation(tripId: string, id: string) {
    const row = await tripAccommodationRepository.delete(tripId, id);
    if (!row) {
      throw new NotFoundError("Trip accommodation expense not found");
    }

    return {
      message: "Trip accommodation expense deleted",
      data: row,
    };
  }
}

export const tripExpenseService = new TripExpenseService();
