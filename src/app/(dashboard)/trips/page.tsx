"use client";

import { useState } from "react";

import { Alert, Button, PageHeader } from "@/ui/components";
import { useAuth } from "@/ui/providers/AuthProvider";
import { confirmDelete, showError, showSuccess } from "@/ui/utils/swal";

import { TripFormModal } from "./_components/TripFormModal";
import { TripTable } from "./_components/TripTable";
import { Trip, useTrips } from "./_hooks/useTrips";

export default function TripsPage() {
  const { user } = useAuth();
  const canEdit = user?.role === "admin" || user?.role === "user";

  const { trips, loading, error, createTrip, updateTrip, deleteTrip } = useTrips();

  const [openForm, setOpenForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const handleCreate = async (payload: Record<string, unknown>) => {
    try {
      await createTrip(payload as Parameters<typeof createTrip>[0]);
      await showSuccess("Data berhasil ditambahkan");
    } catch (caughtError) {
      await showError(caughtError instanceof Error ? caughtError.message : "Gagal menambah trip");
      throw caughtError;
    }
  };

  const handleUpdate = async (payload: Record<string, unknown>) => {
    if (!editingTrip) {
      return;
    }

    try {
      await updateTrip(editingTrip.id, payload as Parameters<typeof updateTrip>[1]);
      await showSuccess("Data berhasil diperbarui");
    } catch (caughtError) {
      await showError(caughtError instanceof Error ? caughtError.message : "Gagal memperbarui trip");
      throw caughtError;
    }
  };

  const handleDelete = async (trip: Trip) => {
    const confirmed = await confirmDelete({
      title: "Hapus data?",
      text: `Data trip "${trip.title}" yang dihapus tidak bisa dikembalikan.`,
    });
    if (!confirmed) {
      return;
    }

    try {
      await deleteTrip(trip.id);
      await showSuccess("Data berhasil dihapus");
    } catch (caughtError) {
      await showError(caughtError instanceof Error ? caughtError.message : "Gagal menghapus trip");
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
