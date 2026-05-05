"use client";

import { useCallback, useEffect, useState } from "react";

import { ApiClientError, apiClient } from "@/ui/api/client";

export type Member = {
  id: string;
  name: string;
};

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const rows = await apiClient.get<Member[]>("/api/members");
      setMembers(rows);
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Gagal memuat members";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchMembers();
  }, [fetchMembers]);

  const createMember = async (payload: { name: string }) => {
    try {
      await apiClient.post<Member, { name: string }>("/api/members", payload);
      await fetchMembers();
    } catch (caughtError) {
      if (caughtError instanceof ApiClientError) {
        throw caughtError;
      }

      throw new Error("Gagal menambah member");
    }
  };

  const updateMember = async (id: string, payload: { name: string }) => {
    try {
      await apiClient.patch<Member, { name: string }>(`/api/members/${id}`, payload);
      await fetchMembers();
    } catch (caughtError) {
      if (caughtError instanceof ApiClientError) {
        throw caughtError;
      }

      throw new Error("Gagal mengubah member");
    }
  };

  const deleteMember = async (id: string) => {
    try {
      await apiClient.del(`/api/members/${id}`);
      await fetchMembers();
    } catch (caughtError) {
      if (caughtError instanceof ApiClientError) {
        throw caughtError;
      }

      throw new Error("Gagal menghapus member");
    }
  };

  return {
    members,
    loading,
    error,
    createMember,
    updateMember,
    deleteMember,
  };
}
