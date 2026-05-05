"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { ApiClientError, apiClient } from "@/ui/api/client";

export type TripData = {
  id: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string | null;
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

  const invokeAction = async (action: () => Promise<unknown>) => {
    try {
      await action();
      await fetchAll();
    } catch (caughtError) {
      if (caughtError instanceof ApiClientError) {
        throw caughtError;
      }

      throw new Error(caughtError instanceof Error ? caughtError.message : "Action gagal");
    }
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
    allMembers,
    memberMap,
    loading,
    error,
    refresh: fetchAll,
    addTripMember: (memberId: string) =>
      invokeAction(() =>
        apiClient.post(`/api/trips/${tripId}/members`, {
          member_id: memberId,
        }),
      ),
    removeTripMember: (memberId: string) =>
      invokeAction(() => apiClient.del(`/api/trips/${tripId}/members/${memberId}`)),
    createTripLogistic: (payload: TripLogisticPayload) =>
      invokeAction(() => apiClient.post(`/api/trips/${tripId}/expenses/logistics`, payload)),
    updateTripLogistic: (id: string, payload: Partial<TripLogisticPayload>) =>
      invokeAction(() => apiClient.patch(`/api/trips/${tripId}/expenses/logistics/${id}`, payload)),
    deleteTripLogistic: (id: string) =>
      invokeAction(() => apiClient.del(`/api/trips/${tripId}/expenses/logistics/${id}`)),
    createTripConsumption: (payload: TripConsumptionPayload) =>
      invokeAction(() => apiClient.post(`/api/trips/${tripId}/expenses/consumptions`, payload)),
    updateTripConsumption: (id: string, payload: Partial<TripConsumptionPayload>) =>
      invokeAction(() => apiClient.patch(`/api/trips/${tripId}/expenses/consumptions/${id}`, payload)),
    deleteTripConsumption: (id: string) =>
      invokeAction(() => apiClient.del(`/api/trips/${tripId}/expenses/consumptions/${id}`)),
    createTripAccommodation: (payload: TripAccommodationPayload) =>
      invokeAction(() => apiClient.post(`/api/trips/${tripId}/expenses/accommodations`, payload)),
    updateTripAccommodation: (id: string, payload: Partial<TripAccommodationPayload>) =>
      invokeAction(() =>
        apiClient.patch(`/api/trips/${tripId}/expenses/accommodations/${id}`, payload),
      ),
    deleteTripAccommodation: (id: string) =>
      invokeAction(() => apiClient.del(`/api/trips/${tripId}/expenses/accommodations/${id}`)),
    createFund: (payload: FundPayload) =>
      invokeAction(() => apiClient.post(`/api/trips/${tripId}/funds`, payload)),
    updateFund: (id: string, payload: Partial<FundPayload>) =>
      invokeAction(() => apiClient.patch(`/api/trips/${tripId}/funds/${id}`, payload)),
    deleteFund: (id: string) => invokeAction(() => apiClient.del(`/api/trips/${tripId}/funds/${id}`)),
  };
}
