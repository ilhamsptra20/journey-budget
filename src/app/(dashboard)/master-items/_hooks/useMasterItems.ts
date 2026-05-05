"use client";

import { useCallback, useEffect, useState } from "react";

import { ApiClientError, apiClient } from "@/ui/api/client";

export type MasterTab = "logistics" | "consumptions" | "accommodations";

export type LogisticItem = {
  id: string;
  title: string;
  unit: string;
  defaultPrice: number | null;
};

export type ConsumptionItem = {
  id: string;
  title: string;
  category: "makan_berat" | "makanan_ringan" | "minuman" | "bumbu" | "other";
  unit: string;
  defaultPrice: number | null;
};

export type AccommodationItem = {
  id: string;
  title: string;
  category: "transport" | "tiket" | "penginapan" | "simaksi" | "parkir" | "other";
  unit: string;
  defaultPrice: number | null;
};

export type MasterItemPayload = {
  title: string;
  unit: string;
  default_price?: number | null;
  category?: string;
};

export function useMasterItems(tab: MasterTab) {
  const [items, setItems] = useState<Array<LogisticItem | ConsumptionItem | AccommodationItem>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const endpoint = `/api/master-items/${tab}`;

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const rows = await apiClient.get<Array<LogisticItem | ConsumptionItem | AccommodationItem>>(endpoint);
      setItems(rows);
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Gagal memuat data";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchItems();
  }, [fetchItems]);

  const createItem = async (payload: MasterItemPayload) => {
    try {
      await apiClient.post(endpoint, payload);
      await fetchItems();
    } catch (caughtError) {
      if (caughtError instanceof ApiClientError) {
        throw caughtError;
      }

      throw new Error("Gagal menambah item");
    }
  };

  const updateItem = async (id: string, payload: MasterItemPayload) => {
    try {
      await apiClient.patch(`${endpoint}/${id}`, payload);
      await fetchItems();
    } catch (caughtError) {
      if (caughtError instanceof ApiClientError) {
        throw caughtError;
      }

      throw new Error("Gagal memperbarui item");
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await apiClient.del(`${endpoint}/${id}`);
      await fetchItems();
    } catch (caughtError) {
      if (caughtError instanceof ApiClientError) {
        throw caughtError;
      }

      throw new Error("Gagal menghapus item");
    }
  };

  return {
    items,
    loading,
    error,
    createItem,
    updateItem,
    deleteItem,
  };
}
