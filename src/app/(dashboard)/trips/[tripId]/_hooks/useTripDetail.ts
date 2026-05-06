"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { ApiClientError, apiClient } from "@/ui/api/client";

export type ExpenseType = "trip_logistics" | "trip_consumptions" | "trip_accommodations";

export type TripData = {
  id: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string | null;
  publicReportEnabled: boolean;
};

export type PublicReportActionResponse = {
  public_report_enabled: boolean;
  public_report_token: string | null;
  share_link: string | null;
};

export type Member = {
  id: string;
  name: string;
};

export type TripMemberRow = {
  id: string;
  trip_id: string;
  member_id: string;
  member_name: string;
};

export type LogisticItem = {
  id: string;
  title: string;
  unit: string;
  defaultPrice: number | null;
};

export type ConsumptionItem = {
  id: string;
  title: string;
  category: string;
  unit: string;
  defaultPrice: number | null;
};

export type AccommodationItem = {
  id: string;
  title: string;
  category: string;
  unit: string;
  defaultPrice: number | null;
};

export type TripLogisticRow = {
  id: string;
  tripId: string;
  logisticItemId: string;
  acquisitionType: "beli" | "sewa" | "bawa_sendiri" | "pinjam";
  scope: "group" | "personal";
  costType: "paid" | "free";
  price: number | null;
  count: number;
  duration: number | null;
};

export type TripConsumptionRow = {
  id: string;
  tripId: string;
  consumptionItemId: string;
  time: "pagi" | "siang" | "malam" | "perjalanan" | "camp" | "summit" | "other";
  scope: "group" | "personal";
  price: number;
  count: number;
};

export type TripAccommodationRow = {
  id: string;
  tripId: string;
  accommodationItemId: string;
  scope: "group" | "personal";
  price: number;
  count: number;
};

export type FundRow = {
  id: string;
  tripId: string;
  type: "kolektif" | "donatur";
  memberId: string | null;
  sourceName: string | null;
  amount: number;
  paidAt: string | null;
  method: string | null;
  note: string | null;
};

export type ExpenseParticipantRow = {
  id: string;
  expense_type: ExpenseType;
  expense_id: string;
  member_id: string;
  member_name: string;
};

export type SummaryData = {
  trip: TripData;
  members_count: number;
  expenses: {
    logistics: number;
    consumptions: number;
    accommodations: number;
    total: number;
  };
  funds: {
    kolektif: number;
    donatur: number;
    total: number;
  };
  saldo_trip: number;
  members: Array<{
    member_id: string;
    name: string;
    tagihan: number;
    bayar: number;
    sisa: number;
    status: "unpaid" | "partial" | "paid";
  }>;
};

export type TripLogisticPayload = {
  logistic_item_id: string;
  acquisition_type: "beli" | "sewa" | "bawa_sendiri" | "pinjam";
  scope: "group" | "personal";
  cost_type: "paid" | "free";
  price?: number | null;
  count: number;
  duration?: number | null;
};

export type TripConsumptionPayload = {
  consumption_item_id: string;
  time: "pagi" | "siang" | "malam" | "perjalanan" | "camp" | "summit" | "other";
  scope: "group" | "personal";
  price: number;
  count: number;
};

export type TripAccommodationPayload = {
  accommodation_item_id: string;
  scope: "group" | "personal";
  price: number;
  count: number;
};

export type FundPayload = {
  type: "kolektif" | "donatur";
  member_id?: string | null;
  source_name?: string | null;
  amount: number;
  paid_at?: string | null;
  method?: string | null;
  note?: string | null;
};

type ExpenseParticipantsMap = Record<string, ExpenseParticipantRow[]>;

function participantMapKey(expenseType: ExpenseType, expenseId: string) {
  return `${expenseType}:${expenseId}`;
}

function uniqueMemberIds(memberIds: string[]) {
  return [...new Set(memberIds.filter(Boolean))];
}

async function fetchParticipantsByExpense(
  expenseType: ExpenseType,
  expenseIds: string[],
): Promise<ExpenseParticipantsMap> {
  const participantsMap: ExpenseParticipantsMap = {};

  if (expenseIds.length === 0) {
    return participantsMap;
  }

  const rowsByExpense = await Promise.all(
    expenseIds.map((expenseId) =>
      apiClient.get<ExpenseParticipantRow[]>("/api/expense-participants", {
        expenseType,
        expenseId,
      }),
    ),
  );

  rowsByExpense.forEach((rows, index) => {
    participantsMap[participantMapKey(expenseType, expenseIds[index])] = rows;
  });

  return participantsMap;
}

export function useTripDetail(tripId: string) {
  const [trip, setTrip] = useState<TripData | null>(null);
  const [tripMembers, setTripMembers] = useState<TripMemberRow[]>([]);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);

  const [logisticItems, setLogisticItems] = useState<LogisticItem[]>([]);
  const [consumptionItems, setConsumptionItems] = useState<ConsumptionItem[]>([]);
  const [accommodationItems, setAccommodationItems] = useState<AccommodationItem[]>([]);

  const [tripLogistics, setTripLogistics] = useState<TripLogisticRow[]>([]);
  const [tripConsumptions, setTripConsumptions] = useState<TripConsumptionRow[]>([]);
  const [tripAccommodations, setTripAccommodations] = useState<TripAccommodationRow[]>([]);
  const [funds, setFunds] = useState<FundRow[]>([]);
  const [expenseParticipantsMap, setExpenseParticipantsMap] = useState<ExpenseParticipantsMap>({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [
        tripData,
        tripMemberRows,
        summaryData,
        logisticMaster,
        consumptionMaster,
        accommodationMaster,
        logisticRows,
        consumptionRows,
        accommodationRows,
        fundRows,
        memberRows,
      ] = await Promise.all([
        apiClient.get<TripData>(`/api/trips/${tripId}`),
        apiClient.get<TripMemberRow[]>(`/api/trips/${tripId}/members`),
        apiClient.get<SummaryData>(`/api/trips/${tripId}/summary`),
        apiClient.get<LogisticItem[]>("/api/master-items/logistics"),
        apiClient.get<ConsumptionItem[]>("/api/master-items/consumptions"),
        apiClient.get<AccommodationItem[]>("/api/master-items/accommodations"),
        apiClient.get<TripLogisticRow[]>(`/api/trips/${tripId}/expenses/logistics`),
        apiClient.get<TripConsumptionRow[]>(`/api/trips/${tripId}/expenses/consumptions`),
        apiClient.get<TripAccommodationRow[]>(`/api/trips/${tripId}/expenses/accommodations`),
        apiClient.get<FundRow[]>(`/api/trips/${tripId}/funds`),
        apiClient.get<Member[]>("/api/members"),
      ]);

      const [logisticParticipants, consumptionParticipants, accommodationParticipants] =
        await Promise.all([
          fetchParticipantsByExpense(
            "trip_logistics",
            logisticRows.map((row) => row.id),
          ),
          fetchParticipantsByExpense(
            "trip_consumptions",
            consumptionRows.map((row) => row.id),
          ),
          fetchParticipantsByExpense(
            "trip_accommodations",
            accommodationRows.map((row) => row.id),
          ),
        ]);

      setTrip(tripData);
      setTripMembers(tripMemberRows);
      setSummary(summaryData);
      setLogisticItems(logisticMaster);
      setConsumptionItems(consumptionMaster);
      setAccommodationItems(accommodationMaster);
      setTripLogistics(logisticRows);
      setTripConsumptions(consumptionRows);
      setTripAccommodations(accommodationRows);
      setFunds(fundRows);
      setAllMembers(memberRows);
      setExpenseParticipantsMap({
        ...logisticParticipants,
        ...consumptionParticipants,
        ...accommodationParticipants,
      });
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Gagal memuat detail trip";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchAll();
  }, [fetchAll]);

  const memberMap = useMemo(() => {
    const map = new Map<string, string>();

    for (const member of allMembers) {
      map.set(member.id, member.name);
    }

    return map;
  }, [allMembers]);

  const invokeAction = async <T>(action: () => Promise<T>): Promise<T> => {
    try {
      const result = await action();
      await fetchAll();
      return result;
    } catch (caughtError) {
      if (caughtError instanceof ApiClientError) {
        throw caughtError;
      }

      throw new Error(caughtError instanceof Error ? caughtError.message : "Action gagal");
    }
  };

  const replaceExpenseParticipants = async (
    expenseType: ExpenseType,
    expenseId: string,
    memberIds: string[],
  ) => {
    const existing = await apiClient.get<ExpenseParticipantRow[]>("/api/expense-participants", {
      expenseType,
      expenseId,
    });

    await Promise.all(
      existing.map((row) => apiClient.del(`/api/expense-participants/${row.id}`)),
    );

    const normalizedMemberIds = uniqueMemberIds(memberIds);

    if (normalizedMemberIds.length > 0) {
      await apiClient.post("/api/expense-participants", {
        expense_type: expenseType,
        expense_id: expenseId,
        member_ids: normalizedMemberIds,
      });
    }
  };

  const createExpenseWithParticipants = async (
    expenseType: ExpenseType,
    createExpense: () => Promise<{ id: string; scope: "group" | "personal" }>,
    participantIds: string[],
  ) => {
    await invokeAction(async () => {
      const expense = await createExpense();

      if (expense.scope === "personal" && participantIds.length === 0) {
        throw new ApiClientError("Participants wajib untuk scope personal", 422, {
          errors: [{ path: ["participants"], message: "Participants wajib untuk scope personal" }],
        });
      }

      await replaceExpenseParticipants(expenseType, expense.id, participantIds);
    });
  };

  const updateExpenseWithParticipants = async (
    expenseType: ExpenseType,
    updateExpense: () => Promise<{ id: string; scope: "group" | "personal" }>,
    participantIds: string[],
  ) => {
    await invokeAction(async () => {
      const expense = await updateExpense();

      if (expense.scope === "personal" && participantIds.length === 0) {
        throw new ApiClientError("Participants wajib untuk scope personal", 422, {
          errors: [{ path: ["participants"], message: "Participants wajib untuk scope personal" }],
        });
      }

      await replaceExpenseParticipants(expenseType, expense.id, participantIds);
    });
  };

  return {
    trip,
    tripMembers,
    summary,
    logisticItems,
    consumptionItems,
    accommodationItems,
    tripLogistics,
    tripConsumptions,
    tripAccommodations,
    funds,
    expenseParticipantsMap,
    allMembers,
    memberMap,
    loading,
    error,
    refresh: fetchAll,
    getExpenseParticipantsMemberIds: (expenseType: ExpenseType, expenseId: string) => {
      const rows = expenseParticipantsMap[participantMapKey(expenseType, expenseId)] ?? [];
      return rows.map((row) => row.member_id);
    },
    addTripMember: (memberId: string) =>
      invokeAction(() =>
        apiClient.post(`/api/trips/${tripId}/members`, {
          member_id: memberId,
        }),
      ),
    removeTripMember: (memberId: string) =>
      invokeAction(() => apiClient.del(`/api/trips/${tripId}/members/${memberId}`)),
    createLogisticMasterItem: async (title: string) => {
      return apiClient.post<LogisticItem, { title: string; unit: string; default_price: number | null }>(
        "/api/master-items/logistics",
        {
          title,
          unit: "pcs",
          default_price: null,
        },
      );
    },
    createConsumptionMasterItem: async (title: string) => {
      return apiClient.post<ConsumptionItem, {
        title: string;
        category: "other";
        unit: string;
        default_price: number | null;
      }>("/api/master-items/consumptions", {
        title,
        category: "other",
        unit: "pcs",
        default_price: null,
      });
    },
    createAccommodationMasterItem: async (title: string) => {
      return apiClient.post<AccommodationItem, {
        title: string;
        category: "other";
        unit: string;
        default_price: number | null;
      }>("/api/master-items/accommodations", {
        title,
        category: "other",
        unit: "pcs",
        default_price: null,
      });
    },
    createTripLogistic: (payload: TripLogisticPayload, participantIds: string[]) =>
      createExpenseWithParticipants(
        "trip_logistics",
        () => apiClient.post<TripLogisticRow, TripLogisticPayload>(`/api/trips/${tripId}/expenses/logistics`, payload),
        participantIds,
      ),
    updateTripLogistic: (
      id: string,
      payload: Partial<TripLogisticPayload>,
      participantIds: string[],
    ) =>
      updateExpenseWithParticipants(
        "trip_logistics",
        () => apiClient.patch<TripLogisticRow, Partial<TripLogisticPayload>>(`/api/trips/${tripId}/expenses/logistics/${id}`, payload),
        participantIds,
      ),
    deleteTripLogistic: (id: string) =>
      invokeAction(() => apiClient.del(`/api/trips/${tripId}/expenses/logistics/${id}`)),
    createTripConsumption: (payload: TripConsumptionPayload, participantIds: string[]) =>
      createExpenseWithParticipants(
        "trip_consumptions",
        () =>
          apiClient.post<TripConsumptionRow, TripConsumptionPayload>(
            `/api/trips/${tripId}/expenses/consumptions`,
            payload,
          ),
        participantIds,
      ),
    updateTripConsumption: (
      id: string,
      payload: Partial<TripConsumptionPayload>,
      participantIds: string[],
    ) =>
      updateExpenseWithParticipants(
        "trip_consumptions",
        () =>
          apiClient.patch<TripConsumptionRow, Partial<TripConsumptionPayload>>(
            `/api/trips/${tripId}/expenses/consumptions/${id}`,
            payload,
          ),
        participantIds,
      ),
    deleteTripConsumption: (id: string) =>
      invokeAction(() => apiClient.del(`/api/trips/${tripId}/expenses/consumptions/${id}`)),
    createTripAccommodation: (payload: TripAccommodationPayload, participantIds: string[]) =>
      createExpenseWithParticipants(
        "trip_accommodations",
        () =>
          apiClient.post<TripAccommodationRow, TripAccommodationPayload>(
            `/api/trips/${tripId}/expenses/accommodations`,
            payload,
          ),
        participantIds,
      ),
    updateTripAccommodation: (
      id: string,
      payload: Partial<TripAccommodationPayload>,
      participantIds: string[],
    ) =>
      updateExpenseWithParticipants(
        "trip_accommodations",
        () =>
          apiClient.patch<TripAccommodationRow, Partial<TripAccommodationPayload>>(
            `/api/trips/${tripId}/expenses/accommodations/${id}`,
            payload,
          ),
        participantIds,
      ),
    deleteTripAccommodation: (id: string) =>
      invokeAction(() => apiClient.del(`/api/trips/${tripId}/expenses/accommodations/${id}`)),
    createFund: (payload: FundPayload) =>
      invokeAction(() => apiClient.post(`/api/trips/${tripId}/funds`, payload)),
    updateFund: (id: string, payload: Partial<FundPayload>) =>
      invokeAction(() => apiClient.patch(`/api/trips/${tripId}/funds/${id}`, payload)),
    deleteFund: (id: string) => invokeAction(() => apiClient.del(`/api/trips/${tripId}/funds/${id}`)),
    enablePublicReport: () =>
      invokeAction(() =>
        apiClient.post<PublicReportActionResponse, Record<string, never>>(
          `/api/trips/${tripId}/public-report/enable`,
          {},
        ),
      ),
    regeneratePublicReport: () =>
      invokeAction(() =>
        apiClient.post<PublicReportActionResponse, Record<string, never>>(
          `/api/trips/${tripId}/public-report/regenerate`,
          {},
        ),
      ),
    disablePublicReport: () =>
      invokeAction(() =>
        apiClient.post<PublicReportActionResponse, Record<string, never>>(
          `/api/trips/${tripId}/public-report/disable`,
          {},
        ),
      ),
  };
}
