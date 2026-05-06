"use client";

import { useState } from "react";

import { ApiClientError } from "@/ui/api/client";
import { Alert, Button, PageHeader } from "@/ui/components";
import { useAuth } from "@/ui/providers/AuthProvider";

import { TripFormModal } from "./_components/TripFormModal";
import { TripTable } from "./_components/TripTable";
import { Trip, useTrips } from "./_hooks/useTrips";

export default function TripsPage() {
  const { user } = useAuth();
  const canEdit = user?.role === "admin" || user?.role === "user";

  const { trips, loading, error, createTrip, updateTrip, deleteTrip } = useTrips();

  const [openForm, setOpenForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [actionError, setActionError] = useState("");

  const handleCreate = async (payload: Record<string, unknown>) => {
    await createTrip(payload as Parameters<typeof createTrip>[0]);
  };

  const handleUpdate = async (payload: Record<string, unknown>) => {
    if (!editingTrip) {
      return;
    }

    await updateTrip(editingTrip.id, payload as Parameters<typeof updateTrip>[1]);
  };

  const handleDelete = async (trip: Trip) => {
    const confirmed = window.confirm(`Hapus trip \"${trip.title}\"?`);
    if (!confirmed) {
      return;
    }

    setActionError("");

    try {
      await deleteTrip(trip.id);
    } catch (caughtError) {
      if (caughtError instanceof ApiClientError) {
        setActionError(caughtError.message);
      } else {
        setActionError("Gagal menghapus trip");
      }
    }
  };

  return (
    <div className="min-w-0 space-y-5 overflow-x-hidden">
      <PageHeader
        title="Trips"
        description="Kelola daftar trip dan masuk ke detail budgeting per trip"
        action={
          canEdit ? (
            <Button
              onClick={() => {
                setEditingTrip(null);
                setOpenForm(true);
              }}
            >
              Create Trip
            </Button>
          ) : null
        }
      />

      {error ? <Alert tone="danger">{error}</Alert> : null}
      {actionError ? <Alert tone="danger">{actionError}</Alert> : null}

      <TripTable
        trips={trips}
        loading={loading}
        canEdit={canEdit}
        onEdit={(trip) => {
          setEditingTrip(trip);
          setOpenForm(true);
        }}
        onDelete={handleDelete}
      />

      <TripFormModal
        open={openForm}
        mode={editingTrip ? "edit" : "create"}
        initialData={editingTrip}
        onClose={() => {
          setOpenForm(false);
          setEditingTrip(null);
        }}
        onSubmit={editingTrip ? handleUpdate : handleCreate}
      />
    </div>
  );
}
