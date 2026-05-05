import { z } from "zod";

const moneySchema = z.number().min(0, "Value cannot be negative");

export const createLogisticItemSchema = z.object({
  title: z.string().trim().min(1).max(255),
  unit: z.string().trim().min(1).max(50),
  default_price: moneySchema.nullish(),
});

export const updateLogisticItemSchema = createLogisticItemSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  {
    message: "At least one field must be provided",
  },
);

export const createConsumptionItemSchema = z.object({
  title: z.string().trim().min(1).max(255),
  category: z.enum(["makan_berat", "makanan_ringan", "minuman", "bumbu", "other"]),
  unit: z.string().trim().min(1).max(50),
  default_price: moneySchema.nullish(),
});

export const updateConsumptionItemSchema = createConsumptionItemSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

export const createAccommodationItemSchema = z.object({
  title: z.string().trim().min(1).max(255),
  category: z.enum(["transport", "tiket", "penginapan", "simaksi", "parkir", "other"]),
  unit: z.string().trim().min(1).max(50),
  default_price: moneySchema.nullish(),
});

export const updateAccommodationItemSchema = createAccommodationItemSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

export type CreateLogisticItemInput = z.infer<typeof createLogisticItemSchema>;
export type UpdateLogisticItemInput = z.infer<typeof updateLogisticItemSchema>;
export type CreateConsumptionItemInput = z.infer<typeof createConsumptionItemSchema>;
export type UpdateConsumptionItemInput = z.infer<typeof updateConsumptionItemSchema>;
export type CreateAccommodationItemInput = z.infer<typeof createAccommodationItemSchema>;
export type UpdateAccommodationItemInput = z.infer<typeof updateAccommodationItemSchema>;
