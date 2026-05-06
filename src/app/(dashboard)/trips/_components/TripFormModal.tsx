"use client";

import { useEffect, useState } from "react";

import { ApiClientError } from "@/ui/api/client";
import { Alert, Button, Input, Modal } from "@/ui/components";
import { mapValidationErrors } from "@/ui/utils/validation";

import type { Trip, TripPayload } from "../_hooks/useTrips";

type TripFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  initialData?: Trip | null;
  onClose: () => void;
  onSubmit: (payload: TripPayload | Partial<TripPayload>) => Promise<void>;
};

export function TripFormModal({
  open,
  mode,
  initialData,
  onClose,
  onSubmit,
}: TripFormModalProps) {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const loadingText = mode === "create" ? "Menyimpan data..." : "Memperbarui data...";

  useEffect(() => {
    if (!open) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTitle(initialData?.title ?? "");
    setLocation(initialData?.location ?? "");
    setStartDate(initialData?.startDate ?? "");
    setEndDate(initialData?.endDate ?? "");
    setError("");
    setFieldErrors({});
  }, [open, initialData]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload: TripPayload = {
      title,
      location,
      start_date: startDate,
      end_date: endDate || null,
    };

    setSubmitting(true);
    setError("");
    setFieldErrors({});

    try {
      await onSubmit(payload);
      onClose();
    } catch (caughtError) {
      if (caughtError instanceof ApiClientError) {
        setError(caughtError.message);
        setFieldErrors(mapValidationErrors(caughtError.details));
      } else {
        setError(caughtError instanceof Error ? caughtError.message : "Gagal menyimpan trip");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Buat Trip" : "Edit Trip"}
      isSubmitting={submitting}
      disableClose={submitting}
      loadingText={loadingText}
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="trip-form" loading={submitting}>
            Simpan
          </Button>
        </div>
      }
    >
      <form id="trip-form" className="space-y-4" onSubmit={handleSubmit}>
        {error ? <Alert tone="danger">{error}</Alert> : null}
        <Input
          label="Title"
          name="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          error={fieldErrors.title}
          disabled={submitting}
          required
        />
        <Input
          label="Location"
          name="location"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          error={fieldErrors.location}
          disabled={submitting}
          required
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Start Date"
            name="start_date"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            error={fieldErrors.start_date}
            disabled={submitting}
            required
          />
          <Input
            label="End Date"
            name="end_date"
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            error={fieldErrors.end_date}
            disabled={submitting}
          />
        </div>
      </form>
    </Modal>
  );
}
