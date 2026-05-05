import { NotFoundError } from "@/core/http/errors";

import { summaryRepository } from "./summary.repository";

type ExpenseRow = {
  type: "trip_logistics" | "trip_consumptions" | "trip_accommodations";
  id: string;
  amount: number;
  scope: "group" | "personal";
};

const toMoney = (value: number) => Number(value.toFixed(2));

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

    const logisticTotal = logistics.reduce((total, row) => {
      if (row.costType === "free") {
        return total;
      }

      if (row.acquisitionType === "sewa") {
        return total + (row.price ?? 0) * row.count * (row.duration ?? 0);
      }

      return total + (row.price ?? 0) * row.count;
    }, 0);

    const consumptionTotal = consumptions.reduce((total, row) => {
      return total + row.price * row.count;
    }, 0);

    const accommodationTotal = accommodations.reduce((total, row) => {
      return total + row.price * row.count;
    }, 0);

    const totalExpense = logisticTotal + consumptionTotal + accommodationTotal;

    const totalKolektif = fundRows
      .filter((row) => row.type === "kolektif")
      .reduce((total, row) => total + row.amount, 0);

    const totalDonatur = fundRows
      .filter((row) => row.type === "donatur")
      .reduce((total, row) => total + row.amount, 0);

    const saldoTrip = totalKolektif + totalDonatur - totalExpense;

    const participantMap = buildParticipantMap([
      ...logisticParticipants,
      ...consumptionParticipants,
      ...accommodationParticipants,
    ]);

    const expenseRows: ExpenseRow[] = [
      ...logistics.map((row) => ({
        type: "trip_logistics" as const,
        id: row.id,
        amount:
          row.costType === "free"
            ? 0
            : row.acquisitionType === "sewa"
              ? (row.price ?? 0) * row.count * (row.duration ?? 0)
              : (row.price ?? 0) * row.count,
        scope: row.scope,
      })),
      ...consumptions.map((row) => ({
        type: "trip_consumptions" as const,
        id: row.id,
        amount: row.price * row.count,
        scope: row.scope,
      })),
      ...accommodations.map((row) => ({
        type: "trip_accommodations" as const,
        id: row.id,
        amount: row.price * row.count,
        scope: row.scope,
      })),
    ];

    const tripMemberIds = tripMembers.map((member) => member.member_id);
    const tagihanMap = new Map<string, number>();

    for (const memberId of tripMemberIds) {
      tagihanMap.set(memberId, 0);
    }

    for (const expense of expenseRows) {
      const key = `${expense.type}:${expense.id}`;
      let participants = participantMap.get(key) ?? [];

      if (participants.length === 0 && expense.scope === "group") {
        participants = tripMemberIds;
      }

      if (participants.length === 0) {
        continue;
      }

      const share = expense.amount / participants.length;
      for (const memberId of participants) {
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
        trip,
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
