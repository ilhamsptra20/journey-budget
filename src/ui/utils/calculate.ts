type MaybeNumber = number | null | undefined;

function toNonNegativeNumber(value: MaybeNumber) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }

  return value < 0 ? 0 : value;
}

type LogisticSubtotalInput = {
  costType?: "paid" | "free" | string | null;
  acquisitionType?: "beli" | "sewa" | "bawa_sendiri" | "pinjam" | string | null;
  price?: MaybeNumber;
  count?: MaybeNumber;
  duration?: MaybeNumber;
};

type ConsumptionSubtotalInput = {
  price?: MaybeNumber;
  count?: MaybeNumber;
};

type AccommodationSubtotalInput = {
  price?: MaybeNumber;
  count?: MaybeNumber;
};

export function calculateLogisticSubtotal(input: LogisticSubtotalInput) {
  if (input.costType === "free") {
    return 0;
  }

  const price = toNonNegativeNumber(input.price);
  const count = toNonNegativeNumber(input.count);

  if (input.acquisitionType === "sewa") {
    const duration = toNonNegativeNumber(input.duration);
    return price * count * duration;
  }

  return price * count;
}

export function calculateConsumptionSubtotal(input: ConsumptionSubtotalInput) {
  const price = toNonNegativeNumber(input.price);
  const count = toNonNegativeNumber(input.count);
  return price * count;
}

export function calculateAccommodationSubtotal(input: AccommodationSubtotalInput) {
  const price = toNonNegativeNumber(input.price);
  const count = toNonNegativeNumber(input.count);
  return price * count;
}
