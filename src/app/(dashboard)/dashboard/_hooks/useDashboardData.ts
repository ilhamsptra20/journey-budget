"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { apiClient } from "@/ui/api/client";

type Trip = {
  id: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string | null;
  createdAt: string;
};

type Member = {
  id: string;
  name: string;
};

export function useDashboardData() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [tripRows, memberRows] = await Promise.all([
        apiClient.get<Trip[]>("/api/trips"),
        apiClient.get<Member[]>("/api/members"),
      ]);

      setTrips(tripRows);
      setMembers(memberRows);
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Gagal memuat data";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchData();
  }, [fetchData]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);

    const activeTrips = trips.filter((trip) => !trip.endDate || trip.endDate >= today).length;

    const recentTrips = [...trips]
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .slice(0, 5);

    return {
      totalTrips: trips.length,
      activeTrips,
      totalMembers: members.length,
      recentTrips,
    };
  }, [trips, members]);

  return {
    loading,
    error,
    stats,
    refresh: fetchData,
  };
}
