import { NotFoundError } from "@/core/http/errors";

import { summaryRepository } from "./summary.repository";

type ExpenseRow = {
  type: "trip_logistics" | "trip_consumptions" | "trip_accommodations";
  id: string;
  amount: number;
  scope: "group" | "personal";
  participants: string[];
};

const toMoney = (value: number) => Number(value.toFixed(2));

function calculateLogisticAmount(row: {
  acquisitionType: "beli" | "sewa" | "bawa_sendiri" | "pinjam";
  costType: "paid" | "free";
  price: number | null;
  count: number;
  duration: number | null;
}) {
  if (row.costType === "free") {
    return 0;
  }

  if (row.acquisitionType === "sewa") {
    return (row.price ?? 0) * row.count * (row.duration ?? 0);
  }

  return (row.price ?? 0) * row.count;
}

function buildParticipantMap(
  rows: Array<{ expense_type: string; expense_id: string; member_id: string }>,
) {
  const result = new Map<string, string[]>();

  for (const row of rows) {
    const key = `${row.expense_type}:${row.expense_id}`;
    const existing = result.get(key);

    if (!existing) {
      result.set(key, [row.member_id]);
      continue;
    }

    existing.push(row.member_id);
  }

  return result;
}

function resolveExpenseParticipants({
  scope,
  key,
  participantMap,
  tripMemberIds,
}: {
  scope: "group" | "personal";
  key: string;
  participantMap: Map<string, string[]>;
  tripMemberIds: string[];
}) {
  const participants = participantMap.get(key) ?? [];

  if (participants.length > 0) {
    return participants;
  }

  if (scope === "group") {
    return tripMemberIds;
  }

  return [];
}

function applyScopeSubtotal({
  scope,
  baseAmount,
  participantsCount,
}: {
  scope: "group" | "personal";
  baseAmount: number;
  participantsCount: number;
}) {
  if (scope === "personal") {
    return baseAmount * participantsCount;
  }

  return baseAmount;
}

class SummaryService {
  async getTripSummary(tripId: string) {
    const trip = await summaryRepository.getTripById(tripId);
    if (!trip) {
      throw new NotFoundError("Trip not found");
    }

    const [tripMembers, logistics, consumptions, accommodations, fundRows] =
      await Promise.all([
      summaryRepository.getTripMembers(tripId),
      summaryRepository.getTripLogistics(tripId),
      summaryRepository.getTripConsumptions(tripId),
      summaryRepository.getTripAccommodations(tripId),
      summaryRepository.getFunds(tripId),
    ]);

    const [logisticParticipants, consumptionParticipants, accommodationParticipants] =
      await Promise.all([
      summaryRepository.getExpenseParticipants(
        "trip_logistics",
        logisticsIdsFromTrip(logistics),
      ),
      summaryRepository.getExpenseParticipants(
        "trip_consumptions",
        consumptionsIdsFromTrip(consumptions),
      ),
      summaryRepository.getExpenseParticipants(
        "trip_accommodations",
        accommodationsIdsFromTrip(accommodations),
      ),
    ]);

    const membersCount = tripMembers.length;

    const totalKolektif = fundRows
      .filter((row) => row.type === "kolektif")
      .reduce((total, row) => total + row.amount, 0);

    const totalDonatur = fundRows
      .filter((row) => row.type === "donatur")
      .reduce((total, row) => total + row.amount, 0);

    const participantMap = buildParticipantMap([
      ...logisticParticipants,
      ...consumptionParticipants,
      ...accommodationParticipants,
    ]);

    const tripMemberIds = tripMembers.map((member) => member.member_id);

    const expenseRows: ExpenseRow[] = [
      ...logistics.map((row) => {
        const key = `trip_logistics:${row.id}`;
        const participants = resolveExpenseParticipants({
          scope: row.scope,
          key,
          participantMap,
          tripMemberIds,
        });
        const baseAmount = calculateLogisticAmount(row);

        return {
          type: "trip_logistics" as const,
          id: row.id,
          amount: applyScopeSubtotal({
            scope: row.scope,
            baseAmount,
            participantsCount: participants.length,
          }),
          scope: row.scope,
          participants,
        };
      }),
      ...consumptions.map((row) => {
        const key = `trip_consumptions:${row.id}`;
        const participants = resolveExpenseParticipants({
          scope: row.scope,
          key,
          participantMap,
          tripMemberIds,
        });
        const baseAmount = row.price * row.count;

        return {
          type: "trip_consumptions" as const,
          id: row.id,
          amount: applyScopeSubtotal({
            scope: row.scope,
            baseAmount,
            participantsCount: participants.length,
          }),
          scope: row.scope,
          participants,
        };
      }),
      ...accommodations.map((row) => {
        const key = `trip_accommodations:${row.id}`;
        const participants = resolveExpenseParticipants({
          scope: row.scope,
          key,
          participantMap,
          tripMemberIds,
        });
        const baseAmount = row.price * row.count;

        return {
          type: "trip_accommodations" as const,
          id: row.id,
          amount: applyScopeSubtotal({
            scope: row.scope,
            baseAmount,
            participantsCount: participants.length,
          }),
          scope: row.scope,
          participants,
        };
      }),
    ];

    const logisticTotal = expenseRows
      .filter((row) => row.type === "trip_logistics")
      .reduce((total, row) => total + row.amount, 0);
    const consumptionTotal = expenseRows
      .filter((row) => row.type === "trip_consumptions")
      .reduce((total, row) => total + row.amount, 0);
    const accommodationTotal = expenseRows
      .filter((row) => row.type === "trip_accommodations")
      .reduce((total, row) => total + row.amount, 0);
    const totalExpense = logisticTotal + consumptionTotal + accommodationTotal;
    const saldoTrip = totalKolektif + totalDonatur - totalExpense;

    const tagihanMap = new Map<string, number>();

    for (const memberId of tripMemberIds) {
      tagihanMap.set(memberId, 0);
    }

    for (const expense of expenseRows) {
      if (expense.participants.length === 0) {
        continue;
      }

      const share = expense.amount / expense.participants.length;
      for (const memberId of expense.participants) {
        const current = tagihanMap.get(memberId) ?? 0;
        tagihanMap.set(memberId, current + share);
      }
    }

    const subsidyPerMember = membersCount > 0 ? totalDonatur / membersCount : 0;

    const bayarMap = new Map<string, number>();
    for (const fund of fundRows) {
      if (fund.type !== "kolektif" || !fund.memberId) {
        continue;
      }

      const current = bayarMap.get(fund.memberId) ?? 0;
      bayarMap.set(fund.memberId, current + fund.amount);
    }

    const memberSummaries = tripMembers.map((member) => {
      const rawTagihan = tagihanMap.get(member.member_id) ?? 0;
      const tagihan = Math.max(0, rawTagihan - subsidyPerMember);
      const bayar = bayarMap.get(member.member_id) ?? 0;
      const sisa = Math.max(0, tagihan - bayar);

      let status: "unpaid" | "partial" | "paid" = "paid";
      if (bayar === 0) {
        status = "unpaid";
      } else if (bayar < tagihan) {
        status = "partial";
      }

      return {
        member_id: member.member_id,
        name: member.name,
        tagihan: toMoney(tagihan),
        bayar: toMoney(bayar),
        sisa: toMoney(sisa),
        status,
      };
    });

    return {
      message: "Trip summary fetched",
      data: {
        trip: {
          id: trip.id,
          title: trip.title,
          location: trip.location,
          startDate: trip.startDate,
          endDate: trip.endDate,
          publicReportEnabled: trip.publicReportEnabled,
        },
        members_count: membersCount,
        expenses: {
          logistics: toMoney(logisticTotal),
          consumptions: toMoney(consumptionTotal),
          accommodations: toMoney(accommodationTotal),
          total: toMoney(totalExpense),
        },
        funds: {
          kolektif: toMoney(totalKolektif),
          donatur: toMoney(totalDonatur),
          total: toMoney(totalKolektif + totalDonatur),
        },
        saldo_trip: toMoney(saldoTrip),
        members: memberSummaries,
      },
    };
  }

  async getPublicReportByToken(token: string) {
    const trip = await summaryRepository.getPublicTripByToken(token);
    if (!trip) {
      throw new NotFoundError("Report not found");
    }

    const [summaryResult, logistics, consumptions, accommodations] = await Promise.all([
      this.getTripSummary(trip.id),
      summaryRepository.getPublicLogisticsBreakdown(trip.id),
      summaryRepository.getPublicConsumptionsBreakdown(trip.id),
      summaryRepository.getPublicAccommodationsBreakdown(trip.id),
    ]);

    const [logisticParticipants, consumptionParticipants, accommodationParticipants] =
      await Promise.all([
      summaryRepository.getExpenseParticipants(
        "trip_logistics",
        logisticsIdsFromTrip(logistics),
      ),
      summaryRepository.getExpenseParticipants(
        "trip_consumptions",
        consumptionsIdsFromTrip(consumptions),
      ),
      summaryRepository.getExpenseParticipants(
        "trip_accommodations",
        accommodationsIdsFromTrip(accommodations),
      ),
    ]);

    const participantMap = buildParticipantMap([
      ...logisticParticipants,
      ...consumptionParticipants,
      ...accommodationParticipants,
    ]);

    return {
      message: "Public report retrieved successfully",
      data: {
        trip: {
          title: trip.title,
          location: trip.location,
          start_date: trip.startDate,
          end_date: trip.endDate,
        },
        members_count: summaryResult.data.members_count,
        expenses: summaryResult.data.expenses,
        funds: summaryResult.data.funds,
        saldo_trip: summaryResult.data.saldo_trip,
        members: summaryResult.data.members.map((member) => ({
          name: member.name,
          tagihan: member.tagihan,
          bayar: member.bayar,
          sisa: member.sisa,
          status: member.status,
        })),
        breakdown: {
          logistics: logistics.map((row) => {
            const participantsCount = calculateExpenseParticipantsCountForPublic({
              key: `trip_logistics:${row.id}`,
              scope: row.scope,
              membersCount: summaryResult.data.members_count,
              participantMap,
            });

            return {
              participants_count: participantsCount,
              item: row.title,
              unit: row.unit,
              acquisition_type: row.acquisitionType,
              scope: row.scope,
              cost_type: row.costType,
              price: row.price,
              count: row.count,
              duration: row.duration,
              amount: toMoney(
                applyScopeSubtotal({
                  scope: row.scope,
                  baseAmount: calculateLogisticAmount({
                    acquisitionType: row.acquisitionType,
                    costType: row.costType,
                    price: row.price,
                    count: row.count,
                    duration: row.duration,
                  }),
                  participantsCount,
                }),
              ),
            };
          }),
          consumptions: consumptions.map((row) => {
            const participantsCount = calculateExpenseParticipantsCountForPublic({
              key: `trip_consumptions:${row.id}`,
              scope: row.scope,
              membersCount: summaryResult.data.members_count,
              participantMap,
            });

            return {
              participants_count: participantsCount,
              item: row.title,
              category: row.category,
              unit: row.unit,
              time: row.time,
              scope: row.scope,
              price: row.price,
              count: row.count,
              amount: toMoney(
                applyScopeSubtotal({
                  scope: row.scope,
                  baseAmount: row.price * row.count,
                  participantsCount,
                }),
              ),
            };
          }),
          accommodations: accommodations.map((row) => {
            const participantsCount = calculateExpenseParticipantsCountForPublic({
              key: `trip_accommodations:${row.id}`,
              scope: row.scope,
              membersCount: summaryResult.data.members_count,
              participantMap,
            });

            return {
              participants_count: participantsCount,
              item: row.title,
              category: row.category,
              unit: row.unit,
              scope: row.scope,
              price: row.price,
              count: row.count,
              amount: toMoney(
                applyScopeSubtotal({
                  scope: row.scope,
                  baseAmount: row.price * row.count,
                  participantsCount,
                }),
              ),
            };
          }),
        },
      },
    };
  }
}

function calculateExpenseParticipantsCountForPublic({
  key,
  scope,
  membersCount,
  participantMap,
}: {
  key: string;
  scope: "group" | "personal";
  membersCount: number;
  participantMap: Map<string, string[]>;
}) {
  const explicitCount = participantMap.get(key)?.length ?? 0;
  if (explicitCount > 0) {
    return explicitCount;
  }

  if (scope === "group") {
    return membersCount;
  }

  return 0;
}

function logisticsIdsFromTrip(
  rows: Array<{ id: string }>,
): string[] {
  return rows.map((row) => row.id);
}

function consumptionsIdsFromTrip(
  rows: Array<{ id: string }>,
): string[] {
  return rows.map((row) => row.id);
}

function accommodationsIdsFromTrip(
  rows: Array<{ id: string }>,
): string[] {
  return rows.map((row) => row.id);
}

export const summaryService = new SummaryService();
