import { relations } from "drizzle-orm";
import {
  accommodationItems,
  consumptionItems,
  expenseParticipants,
  funds,
  logisticItems,
  members,
  tripAccommodations,
  tripConsumptions,
  tripLogistics,
  tripMembers,
  trips,
  users,
} from "./schema";

export const userRelations = relations(users, () => ({}));

export const memberRelations = relations(members, ({ many }) => ({
  tripMembers: many(tripMembers),
  funds: many(funds),
}));

export const tripRelations = relations(trips, ({ many }) => ({
  members: many(tripMembers),
  logistics: many(tripLogistics),
  consumptions: many(tripConsumptions),
  accommodations: many(tripAccommodations),
  funds: many(funds),
}));

export const tripMemberRelations = relations(tripMembers, ({ one }) => ({
  trip: one(trips, {
    fields: [tripMembers.tripId],
    references: [trips.id],
  }),
  member: one(members, {
    fields: [tripMembers.memberId],
    references: [members.id],
  }),
}));

export const logisticItemRelations = relations(logisticItems, ({ many }) => ({
  tripLogistics: many(tripLogistics),
}));

export const consumptionItemRelations = relations(consumptionItems, ({ many }) => ({
  tripConsumptions: many(tripConsumptions),
}));

export const accommodationItemRelations = relations(accommodationItems, ({ many }) => ({
  tripAccommodations: many(tripAccommodations),
}));

export const tripLogisticRelations = relations(tripLogistics, ({ one }) => ({
  trip: one(trips, {
    fields: [tripLogistics.tripId],
    references: [trips.id],
  }),
  logisticItem: one(logisticItems, {
    fields: [tripLogistics.logisticItemId],
    references: [logisticItems.id],
  }),
}));

export const tripConsumptionRelations = relations(tripConsumptions, ({ one }) => ({
  trip: one(trips, {
    fields: [tripConsumptions.tripId],
    references: [trips.id],
  }),
  consumptionItem: one(consumptionItems, {
    fields: [tripConsumptions.consumptionItemId],
    references: [consumptionItems.id],
  }),
}));

export const tripAccommodationRelations = relations(tripAccommodations, ({ one }) => ({
  trip: one(trips, {
    fields: [tripAccommodations.tripId],
    references: [trips.id],
  }),
  accommodationItem: one(accommodationItems, {
    fields: [tripAccommodations.accommodationItemId],
    references: [accommodationItems.id],
  }),
}));

export const expenseParticipantRelations = relations(expenseParticipants, ({ one }) => ({
  member: one(members, {
    fields: [expenseParticipants.memberId],
    references: [members.id],
  }),
}));

export const fundRelations = relations(funds, ({ one }) => ({
  trip: one(trips, {
    fields: [funds.tripId],
    references: [trips.id],
  }),
  member: one(members, {
    fields: [funds.memberId],
    references: [members.id],
  }),
}));
