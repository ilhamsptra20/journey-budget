type MaybeNumber = number | null | undefined;

function toNonNegativeNumber(value: MaybeNumber) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }

  return value < 0 ? 0 : value;
}

function toNonNegativeInteger(value: MaybeNumber) {
  return Math.floor(toNonNegativeNumber(value));
}

export type LogisticSubtotalInput = {
  costType?: "paid" | "free" | string | null;
  cost_type?: "paid" | "free" | string | null;
  acquisitionType?: "beli" | "sewa" | "bawa_sendiri" | "pinjam" | string | null;
  acquisition_type?: "beli" | "sewa" | "bawa_sendiri" | "pinjam" | string | null;
  scope?: "group" | "personal" | string | null;
  price?: MaybeNumber;
  count?: MaybeNumber;
  duration?: MaybeNumber;
  participantIds?: string[] | null;
  participantsCount?: MaybeNumber;
  tripMembersCount?: MaybeNumber;
};

export type ConsumptionSubtotalInput = {
  scope?: "group" | "personal" | string | null;
  price?: MaybeNumber;
  count?: MaybeNumber;
  participantIds?: string[] | null;
  participantsCount?: MaybeNumber;
  tripMembersCount?: MaybeNumber;
};

export type AccommodationSubtotalInput = {
  scope?: "group" | "personal" | string | null;
  price?: MaybeNumber;
  count?: MaybeNumber;
  participantIds?: string[] | null;
  participantsCount?: MaybeNumber;
  tripMembersCount?: MaybeNumber;
};

export type ExpenseParticipantsInput = {
  scope?: "group" | "personal" | string | null;
  participantIds?: string[] | null;
  participantsCount?: MaybeNumber;
  tripMembersCount?: MaybeNumber;
};

function applyScopeMultiplier({
  scope,
  baseAmount,
  participantsCount,
}: {
  scope?: string | null;
  baseAmount: number;
  participantsCount: number;
}) {
  if (scope === "personal") {
    return baseAmount * participantsCount;
  }

  return baseAmount;
}

export function calculateLogisticSubtotal(input: LogisticSubtotalInput) {
  const costType = input.costType ?? input.cost_type;
  const acquisitionType = input.acquisitionType ?? input.acquisition_type;

  if (costType === "free") {
    return 0;
  }

  const price = toNonNegativeNumber(input.price);
  const count = toNonNegativeNumber(input.count);

  const baseAmount = acquisitionType === "sewa"
    ? price * count * toNonNegativeNumber(input.duration)
    : price * count;

  const participantsCount = calculateExpenseParticipantsCount({
    scope: input.scope,
    participantIds: input.participantIds,
    participantsCount: input.participantsCount,
    tripMembersCount: input.tripMembersCount,
  });

  return applyScopeMultiplier({
    scope: input.scope,
    baseAmount,
    participantsCount,
  });
}

export function calculateConsumptionSubtotal(input: ConsumptionSubtotalInput) {
  const baseAmount = toNonNegativeNumber(input.price) * toNonNegativeNumber(input.count);
  const participantsCount = calculateExpenseParticipantsCount({
    scope: input.scope,
    participantIds: input.participantIds,
    participantsCount: input.participantsCount,
    tripMembersCount: input.tripMembersCount,
  });

  return applyScopeMultiplier({
    scope: input.scope,
    baseAmount,
    participantsCount,
  });
}

export function calculateAccommodationSubtotal(input: AccommodationSubtotalInput) {
  const baseAmount = toNonNegativeNumber(input.price) * toNonNegativeNumber(input.count);
  const participantsCount = calculateExpenseParticipantsCount({
    scope: input.scope,
    participantIds: input.participantIds,
    participantsCount: input.participantsCount,
    tripMembersCount: input.tripMembersCount,
  });

  return applyScopeMultiplier({
    scope: input.scope,
    baseAmount,
    participantsCount,
  });
}

export function calculateExpenseParticipantsCount(input: ExpenseParticipantsInput) {
  const explicitCount =
    input.participantsCount !== undefined && input.participantsCount !== null
      ? toNonNegativeInteger(input.participantsCount)
      : (input.participantIds?.length ?? 0);

  if (explicitCount > 0) {
    return explicitCount;
  }

  if (input.scope === "group") {
    return toNonNegativeInteger(input.tripMembersCount);
  }

  return 0;
}

export function calculateParticipantShare(subtotal: number, participantsCount: number) {
  const safeParticipants = toNonNegativeInteger(participantsCount);
  if (safeParticipants <= 0) {
    return 0;
  }

  return toNonNegativeNumber(subtotal) / safeParticipants;
}

export function calculateLogisticsTotal(items: LogisticSubtotalInput[]) {
  return items.reduce((total, item) => total + calculateLogisticSubtotal(item), 0);
}

export function calculateConsumptionsTotal(items: ConsumptionSubtotalInput[]) {
  return items.reduce((total, item) => total + calculateConsumptionSubtotal(item), 0);
}

export function calculateAccommodationsTotal(items: AccommodationSubtotalInput[]) {
  return items.reduce((total, item) => total + calculateAccommodationSubtotal(item), 0);
}

export function calculateLogisticBaseAmount(input: LogisticSubtotalInput) {
  const costType = input.costType ?? input.cost_type;
  if (costType === "free") {
    return 0;
  }

  const acquisitionType = input.acquisitionType ?? input.acquisition_type;
  const price = toNonNegativeNumber(input.price);
  const count = toNonNegativeNumber(input.count);
  const duration = toNonNegativeNumber(input.duration);

  return acquisitionType === "sewa"
    ? price * count * duration
    : price * count;
}

export function calculateConsumptionBaseAmount(input: ConsumptionSubtotalInput) {
  return toNonNegativeNumber(input.price) * toNonNegativeNumber(input.count);
}

export function calculateAccommodationBaseAmount(input: AccommodationSubtotalInput) {
  return toNonNegativeNumber(input.price) * toNonNegativeNumber(input.count);
}
