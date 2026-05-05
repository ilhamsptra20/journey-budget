import { z } from "zod";

const nonNegativeMoney = z.number().min(0, "Value cannot be negative");

export const createTripLogisticSchema = z
  .object({
    logistic_item_id: z.string().uuid(),
    acquisition_type: z.enum(["beli", "sewa", "bawa_sendiri", "pinjam"]),
    scope: z.enum(["group", "personal"]),
    cost_type: z.enum(["paid", "free"]),
    price: nonNegativeMoney.nullish(),
    count: z.number().int().min(1),
    duration: z.number().int().min(1).nullish(),
  })
  .superRefine((payload, ctx) => {
    if (payload.cost_type === "paid" && (payload.price === null || payload.price === undefined)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["price"],
        message: "price is required when cost_type is paid",
      });
    }

    if (payload.acquisition_type === "sewa" && !payload.duration) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["duration"],
        message: "duration is required when acquisition_type is sewa",
      });
    }
  });

export const updateTripLogisticSchema = z
  .object({
    logistic_item_id: z.string().uuid().optional(),
    acquisition_type: z.enum(["beli", "sewa", "bawa_sendiri", "pinjam"]).optional(),
    scope: z.enum(["group", "personal"]).optional(),
    cost_type: z.enum(["paid", "free"]).optional(),
    price: nonNegativeMoney.nullish().optional(),
    count: z.number().int().min(1).optional(),
    duration: z.number().int().min(1).nullish().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

export const createTripConsumptionSchema = z.object({
  consumption_item_id: z.string().uuid(),
  time: z.enum(["pagi", "siang", "malam", "perjalanan", "camp", "summit", "other"]),
  scope: z.enum(["group", "personal"]),
  price: nonNegativeMoney,
  count: z.number().int().min(1),
});

export const updateTripConsumptionSchema = z
  .object({
    consumption_item_id: z.string().uuid().optional(),
    time: z
      .enum(["pagi", "siang", "malam", "perjalanan", "camp", "summit", "other"])
      .optional(),
    scope: z.enum(["group", "personal"]).optional(),
    price: nonNegativeMoney.optional(),
    count: z.number().int().min(1).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

export const createTripAccommodationSchema = z.object({
  accommodation_item_id: z.string().uuid(),
  scope: z.enum(["group", "personal"]),
  price: nonNegativeMoney,
  count: z.number().int().min(1),
});

export const updateTripAccommodationSchema = z
  .object({
    accommodation_item_id: z.string().uuid().optional(),
    scope: z.enum(["group", "personal"]).optional(),
    price: nonNegativeMoney.optional(),
    count: z.number().int().min(1).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

export type CreateTripLogisticInput = z.infer<typeof createTripLogisticSchema>;
export type UpdateTripLogisticInput = z.infer<typeof updateTripLogisticSchema>;
export type CreateTripConsumptionInput = z.infer<typeof createTripConsumptionSchema>;
export type UpdateTripConsumptionInput = z.infer<typeof updateTripConsumptionSchema>;
export type CreateTripAccommodationInput = z.infer<typeof createTripAccommodationSchema>;
export type UpdateTripAccommodationInput = z.infer<typeof updateTripAccommodationSchema>;
