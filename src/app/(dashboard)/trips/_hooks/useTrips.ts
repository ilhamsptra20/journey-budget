"use client";

import { useCallback, useEffect, useState } from "react";

import { ApiClientError, apiClient } from "@/ui/api/client";

export type Trip = {
  id: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string | null;
};

export type TripPayload = {
  title: string;
  location: string;
  start_date: string;
  end_date?: string | null;
};

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const rows = await apiClient.get<Trip[]>("/api/trips");
      setTrips(rows);
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Gagal memuat trips";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchTrips();
  }, [fetchTrips]);

  const createTrip = async (payload: TripPayload) => {
    try {
      await apiClient.post<Trip, TripPayload>("/api/trips", payload);
      await fetchTrips();
    } catch (caughtError) {
      if (caughtError instanceof ApiClientError) {
        throw caughtError;
      }

      throw new Error("Gagal membuat trip");
    }
  };

  const updateTrip = async (id: string, payload: Partial<TripPayload>) => {
    try {
      await apiClient.patch<Trip, Partial<TripPayload>>(`/api/trips/${id}`, payload);
      await fetchTrips();
    } catch (caughtError) {
      if (caughtError instanceof ApiClientError) {
        throw caughtError;
      }

      throw new Error("Gagal memperbarui trip");
    }
  };

  const deleteTrip = async (id: string) => {
    try {
      await apiClient.del(`/api/trips/${id}`);
      await fetchTrips();
    } catch (caughtError) {
      if (caughtError instanceof ApiClientError) {
        throw caughtError;
      }

      throw new Error("Gagal menghapus trip");
    }
  };

  return {
    trips,
    loading,
    error,
    createTrip,
    updateTrip,
    deleteTrip,
    refresh: fetchTrips,
  };
}
