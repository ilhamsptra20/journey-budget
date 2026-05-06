"use client";

import { useCallback, useEffect, useState } from "react";

import { ApiClientError, apiClient } from "@/ui/api/client";

export type PublicReportData = {
  trip: {
    title: string;
    location: string;
    start_date: string;
    end_date: string | null;
  };
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
    name: string;
    tagihan: number;
    bayar: number;
    sisa: number;
    status: "unpaid" | "partial" | "paid";
  }>;
  breakdown: {
    logistics: Array<{
      item: string;
      unit: string;
      acquisition_type: string;
      scope: string;
      cost_type: string;
      price: number | null;
      count: number;
      duration: number | null;
      amount: number;
    }>;
    consumptions: Array<{
      item: string;
      category: string;
      unit: string;
      time: string;
      scope: string;
      price: number;
      count: number;
      amount: number;
    }>;
    accommodations: Array<{
      item: string;
      category: string;
      unit: string;
      scope: string;
      price: number;
      count: number;
      amount: number;
    }>;
  };
};

export function usePublicReport(token: string) {
  const [report, setReport] = useState<PublicReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState(true);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setAvailable(true);

    try {
      const data = await apiClient.get<PublicReportData>(`/api/public/reports/${token}`);
      setReport(data);
    } catch (caughtError) {
      if (caughtError instanceof ApiClientError && caughtError.statusCode === 404) {
        setAvailable(false);
        setReport(null);
      } else {
        setAvailable(false);
        setReport(null);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchReport();
  }, [fetchReport]);

  return {
    report,
    loading,
    available,
    refetch: fetchReport,
  };
}
