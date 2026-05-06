import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["admin", "user", "guest"]);
export const consumptionCategoryEnum = pgEnum("consumption_category", [
  "makan_berat",
  "makanan_ringan",
  "minuman",
  "bumbu",
  "other",
]);
export const accommodationCategoryEnum = pgEnum("accommodation_category", [
  "transport",
  "tiket",
  "penginapan",
  "simaksi",
  "parkir",
  "other",
]);
export const acquisitionTypeEnum = pgEnum("acquisition_type", [
  "beli",
  "sewa",
  "bawa_sendiri",
  "pinjam",
]);
export const scopeEnum = pgEnum("expense_scope", ["group", "personal"]);
export const costTypeEnum = pgEnum("cost_type", ["paid", "free"]);
export const consumptionTimeEnum = pgEnum("consumption_time", [
  "pagi",
  "siang",
  "malam",
  "perjalanan",
  "camp",
  "summit",
  "other",
]);
export const expenseTypeEnum = pgEnum("expense_type", [
  "trip_logistics",
  "trip_consumptions",
  "trip_accommodations",
]);
export const fundTypeEnum = pgEnum("fund_type", ["kolektif", "donatur"]);

const createdAtColumn = timestamp("created_at", { withTimezone: true })
  .defaultNow()
  .notNull();
const updatedAtColumn = timestamp("updated_at", { withTimezone: true })
  .defaultNow()
  .notNull();

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: createdAtColumn,
  updatedAt: updatedAtColumn,
});

export const members = pgTable("members", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  createdAt: createdAtColumn,
  updatedAt: updatedAtColumn,
});

export const trips = pgTable(
  "trips",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    location: varchar("location", { length: 255 }).notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
    publicReportEnabled: boolean("public_report_enabled").default(false).notNull(),
    publicReportToken: text("public_report_token"),
    createdAt: createdAtColumn,
    updatedAt: updatedAtColumn,
  },
  (table) => ({
    publicReportTokenUnique: uniqueIndex("trips_public_report_token_unique").on(
      table.publicReportToken,
    ),
  }),
);

export const tripMembers = pgTable(
  "trip_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tripId: uuid("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    createdAt: createdAtColumn,
    updatedAt: updatedAtColumn,
  },
  (table) => ({
    tripMemberUnique: uniqueIndex("trip_members_trip_id_member_id_unique").on(
      table.tripId,
      table.memberId,
    ),
  }),
);

export const logisticItems = pgTable("logistic_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  defaultPrice: numeric("default_price", { precision: 14, scale: 2, mode: "number" }),
  createdAt: createdAtColumn,
  updatedAt: updatedAtColumn,
});

export const consumptionItems = pgTable("consumption_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  category: consumptionCategoryEnum("category").notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  defaultPrice: numeric("default_price", { precision: 14, scale: 2, mode: "number" }),
  createdAt: createdAtColumn,
  updatedAt: updatedAtColumn,
});

export const accommodationItems = pgTable("accommodation_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  category: accommodationCategoryEnum("category").notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  defaultPrice: numeric("default_price", { precision: 14, scale: 2, mode: "number" }),
  createdAt: createdAtColumn,
  updatedAt: updatedAtColumn,
});

export const tripLogistics = pgTable("trip_logistics", {
  id: uuid("id").defaultRandom().primaryKey(),
  tripId: uuid("trip_id")
    .notNull()
    .references(() => trips.id, { onDelete: "cascade" }),
  logisticItemId: uuid("logistic_item_id")
    .notNull()
    .references(() => logisticItems.id, { onDelete: "restrict" }),
  acquisitionType: acquisitionTypeEnum("acquisition_type").notNull(),
  scope: scopeEnum("scope").notNull(),
  costType: costTypeEnum("cost_type").notNull(),
  price: numeric("price", { precision: 14, scale: 2, mode: "number" }),
  count: integer("count").notNull(),
  duration: integer("duration"),
  createdAt: createdAtColumn,
  updatedAt: updatedAtColumn,
});

export const tripConsumptions = pgTable("trip_consumptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tripId: uuid("trip_id")
    .notNull()
    .references(() => trips.id, { onDelete: "cascade" }),
  consumptionItemId: uuid("consumption_item_id")
    .notNull()
    .references(() => consumptionItems.id, { onDelete: "restrict" }),
  time: consumptionTimeEnum("time").notNull(),
  scope: scopeEnum("scope").notNull(),
  price: numeric("price", { precision: 14, scale: 2, mode: "number" }).notNull(),
  count: integer("count").notNull(),
  createdAt: createdAtColumn,
  updatedAt: updatedAtColumn,
});

export const tripAccommodations = pgTable("trip_accommodations", {
  id: uuid("id").defaultRandom().primaryKey(),
  tripId: uuid("trip_id")
    .notNull()
    .references(() => trips.id, { onDelete: "cascade" }),
  accommodationItemId: uuid("accommodation_item_id")
    .notNull()
    .references(() => accommodationItems.id, { onDelete: "restrict" }),
  scope: scopeEnum("scope").notNull(),
  price: numeric("price", { precision: 14, scale: 2, mode: "number" }).notNull(),
  count: integer("count").notNull(),
  createdAt: createdAtColumn,
  updatedAt: updatedAtColumn,
});

export const expenseParticipants = pgTable("expense_participants", {
  id: uuid("id").defaultRandom().primaryKey(),
  expenseType: expenseTypeEnum("expense_type").notNull(),
  expenseId: uuid("expense_id").notNull(),
  memberId: uuid("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  createdAt: createdAtColumn,
  updatedAt: updatedAtColumn,
});

export const funds = pgTable("funds", {
  id: uuid("id").defaultRandom().primaryKey(),
  tripId: uuid("trip_id")
    .notNull()
    .references(() => trips.id, { onDelete: "cascade" }),
  type: fundTypeEnum("type").notNull(),
  memberId: uuid("member_id").references(() => members.id, {
    onDelete: "set null",
  }),
  sourceName: varchar("source_name", { length: 255 }),
  amount: numeric("amount", { precision: 14, scale: 2, mode: "number" }).notNull(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  method: varchar("method", { length: 100 }),
  note: text("note"),
  createdAt: createdAtColumn,
  updatedAt: updatedAtColumn,
});

export type UserRole = (typeof userRoleEnum.enumValues)[number];
export type ExpenseScope = (typeof scopeEnum.enumValues)[number];
export type ExpenseType = (typeof expenseTypeEnum.enumValues)[number];
export type FundType = (typeof fundTypeEnum.enumValues)[number];

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type Member = InferSelectModel<typeof members>;
export type NewMember = InferInsertModel<typeof members>;
export type Trip = InferSelectModel<typeof trips>;
export type NewTrip = InferInsertModel<typeof trips>;
export type TripMember = InferSelectModel<typeof tripMembers>;
export type NewTripMember = InferInsertModel<typeof tripMembers>;
export type LogisticItem = InferSelectModel<typeof logisticItems>;
export type NewLogisticItem = InferInsertModel<typeof logisticItems>;
export type ConsumptionItem = InferSelectModel<typeof consumptionItems>;
export type NewConsumptionItem = InferInsertModel<typeof consumptionItems>;
export type AccommodationItem = InferSelectModel<typeof accommodationItems>;
export type NewAccommodationItem = InferInsertModel<typeof accommodationItems>;
export type TripLogistic = InferSelectModel<typeof tripLogistics>;
export type NewTripLogistic = InferInsertModel<typeof tripLogistics>;
export type TripConsumption = InferSelectModel<typeof tripConsumptions>;
export type NewTripConsumption = InferInsertModel<typeof tripConsumptions>;
export type TripAccommodation = InferSelectModel<typeof tripAccommodations>;
export type NewTripAccommodation = InferInsertModel<typeof tripAccommodations>;
export type ExpenseParticipant = InferSelectModel<typeof expenseParticipants>;
export type NewExpenseParticipant = InferInsertModel<typeof expenseParticipants>;
export type Fund = InferSelectModel<typeof funds>;
export type NewFund = InferInsertModel<typeof funds>;
