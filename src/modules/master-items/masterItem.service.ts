import { NotFoundError, ValidationApiError } from "@/core/http/errors";

import { accommodationItemRepository } from "./accommodationItem.repository";
import { consumptionItemRepository } from "./consumptionItem.repository";
import { logisticItemRepository } from "./logisticItem.repository";
import {
  createAccommodationItemSchema,
  createConsumptionItemSchema,
  createLogisticItemSchema,
  updateAccommodationItemSchema,
  updateConsumptionItemSchema,
  updateLogisticItemSchema,
} from "./masterItem.validation";

class MasterItemService {
  async listLogistics() {
    return {
      message: "Logistic master items fetched",
      data: await logisticItemRepository.findAll(),
    };
  }

  async createLogistic(input: unknown) {
    const parsed = createLogisticItemSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationApiError(parsed.error.issues);
    }

    const row = await logisticItemRepository.create({
      title: parsed.data.title,
      unit: parsed.data.unit,
      defaultPrice: parsed.data.default_price ?? null,
    });

    return {
      message: "Logistic master item created",
      data: row,
    };
  }

  async updateLogistic(id: string, input: unknown) {
    const parsed = updateLogisticItemSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationApiError(parsed.error.issues);
    }

    const row = await logisticItemRepository.update(id, {
      title: parsed.data.title,
      unit: parsed.data.unit,
      defaultPrice: parsed.data.default_price,
    });

    if (!row) {
      throw new NotFoundError("Logistic master item not found");
    }

    return {
      message: "Logistic master item updated",
      data: row,
    };
  }

  async deleteLogistic(id: string) {
    const row = await logisticItemRepository.delete(id);
    if (!row) {
      throw new NotFoundError("Logistic master item not found");
    }

    return {
      message: "Logistic master item deleted",
      data: row,
    };
  }

  async listConsumptions() {
    return {
      message: "Consumption master items fetched",
      data: await consumptionItemRepository.findAll(),
    };
  }

  async createConsumption(input: unknown) {
    const parsed = createConsumptionItemSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationApiError(parsed.error.issues);
    }

    const row = await consumptionItemRepository.create({
      title: parsed.data.title,
      category: parsed.data.category,
      unit: parsed.data.unit,
      defaultPrice: parsed.data.default_price ?? null,
    });

    return {
      message: "Consumption master item created",
      data: row,
    };
  }

  async updateConsumption(id: string, input: unknown) {
    const parsed = updateConsumptionItemSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationApiError(parsed.error.issues);
    }

    const row = await consumptionItemRepository.update(id, {
      title: parsed.data.title,
      category: parsed.data.category,
      unit: parsed.data.unit,
      defaultPrice: parsed.data.default_price,
    });

    if (!row) {
      throw new NotFoundError("Consumption master item not found");
    }

    return {
      message: "Consumption master item updated",
      data: row,
    };
  }

  async deleteConsumption(id: string) {
    const row = await consumptionItemRepository.delete(id);
    if (!row) {
      throw new NotFoundError("Consumption master item not found");
    }

    return {
      message: "Consumption master item deleted",
      data: row,
    };
  }

  async listAccommodations() {
    return {
      message: "Accommodation master items fetched",
      data: await accommodationItemRepository.findAll(),
    };
  }

  async createAccommodation(input: unknown) {
    const parsed = createAccommodationItemSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationApiError(parsed.error.issues);
    }

    const row = await accommodationItemRepository.create({
      title: parsed.data.title,
      category: parsed.data.category,
      unit: parsed.data.unit,
      defaultPrice: parsed.data.default_price ?? null,
    });

    return {
      message: "Accommodation master item created",
      data: row,
    };
  }

  async updateAccommodation(id: string, input: unknown) {
    const parsed = updateAccommodationItemSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationApiError(parsed.error.issues);
    }

    const row = await accommodationItemRepository.update(id, {
      title: parsed.data.title,
      category: parsed.data.category,
      unit: parsed.data.unit,
      defaultPrice: parsed.data.default_price,
    });

    if (!row) {
      throw new NotFoundError("Accommodation master item not found");
    }

    return {
      message: "Accommodation master item updated",
      data: row,
    };
  }

  async deleteAccommodation(id: string) {
    const row = await accommodationItemRepository.delete(id);
    if (!row) {
      throw new NotFoundError("Accommodation master item not found");
    }

    return {
      message: "Accommodation master item deleted",
      data: row,
    };
  }
}

export const masterItemService = new MasterItemService();
