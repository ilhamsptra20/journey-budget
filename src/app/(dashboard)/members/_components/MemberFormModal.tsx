"use client";

import { useEffect, useState } from "react";

import { ApiClientError } from "@/ui/api/client";
import { Alert, Button, Input, Modal, Spinner } from "@/ui/components";
import { mapValidationErrors } from "@/ui/utils/validation";

import type { Member } from "../_hooks/useMembers";

type MemberFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  initialData?: Member | null;
  onClose: () => void;
  onSubmit: (payload: { name: string }) => Promise<void>;
};

export function MemberFormModal({
  open,
  mode,
  initialData,
  onClose,
  onSubmit,
}: MemberFormModalProps) {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(initialData?.name ?? "");
    setError("");
    setFieldErrors({});
  }, [open, initialData]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setFieldErrors({});

    try {
      await onSubmit({ name });
      onClose();
    } catch (caughtError) {
      if (caughtError instanceof ApiClientError) {
        setError(caughtError.message);
        setFieldErrors(mapValidationErrors(caughtError.details));
      } else {
        setError(caughtError instanceof Error ? caughtError.message : "Gagal menyimpan member");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Tambah Member" : "Edit Member"}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Batal
          </Button>
          <Button form="member-form" type="submit" isLoading={submitting}>
            {submitting ? <Spinner /> : null}
            Simpan
          </Button>
        </div>
      }
    >
      <form id="member-form" className="space-y-4" onSubmit={handleSubmit}>
        {error ? <Alert tone="danger">{error}</Alert> : null}
        <Input
          label="Nama Member"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={fieldErrors.name}
          required
        />
      </form>
    </Modal>
  );
}
