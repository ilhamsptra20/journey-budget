"use client";

import { useEffect, useMemo, useState } from "react";

import { ApiClientError } from "@/ui/api/client";
import { Alert, Button, Input, Modal, Select } from "@/ui/components";
import { mapValidationErrors } from "@/ui/utils/validation";

import { MasterItemPayload, MasterTab } from "../_hooks/useMasterItems";

type ItemLike = {
  id: string;
  title: string;
  unit: string;
  defaultPrice: number | null;
  category?: string;
};

type MasterItemFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  tab: MasterTab;
  initialData?: ItemLike | null;
  onClose: () => void;
  onSubmit: (payload: MasterItemPayload) => Promise<void>;
};

const categoryOptions: Record<MasterTab, Array<{ label: string; value: string }>> = {
  logistics: [],
  consumptions: [
    { label: "Makan Berat", value: "makan_berat" },
    { label: "Makanan Ringan", value: "makanan_ringan" },
    { label: "Minuman", value: "minuman" },
    { label: "Bumbu", value: "bumbu" },
    { label: "Other", value: "other" },
  ],
  accommodations: [
    { label: "Transport", value: "transport" },
    { label: "Tiket", value: "tiket" },
    { label: "Penginapan", value: "penginapan" },
    { label: "Simaksi", value: "simaksi" },
    { label: "Parkir", value: "parkir" },
    { label: "Other", value: "other" },
  ],
};

export function MasterItemFormModal({
  open,
  mode,
  tab,
  initialData,
  onClose,
  onSubmit,
}: MasterItemFormModalProps) {
  const [title, setTitle] = useState("");
  const [unit, setUnit] = useState("");
  const [category, setCategory] = useState("");
  const [defaultPrice, setDefaultPrice] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const showCategory = tab !== "logistics";

  const modalTitle = useMemo(() => {
    const scope =
      tab === "logistics" ? "Logistic" : tab === "consumptions" ? "Consumption" : "Accommodation";

    return mode === "create" ? `Tambah ${scope} Item` : `Edit ${scope} Item`;
  }, [mode, tab]);

  useEffect(() => {
    if (!open) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTitle(initialData?.title ?? "");
    setUnit(initialData?.unit ?? "");
    setCategory(initialData?.category ?? "");
    setDefaultPrice(initialData?.defaultPrice ? String(initialData.defaultPrice) : "");
    setError("");
    setFieldErrors({});
  }, [open, initialData]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload: MasterItemPayload = {
      title,
      unit,
      default_price: defaultPrice ? Number(defaultPrice) : null,
      ...(showCategory ? { category } : {}),
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
        setError(caughtError instanceof Error ? caughtError.message : "Gagal menyimpan item");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={modalTitle}
      isSubmitting={submitting}
      disableClose={submitting}
      loadingText={mode === "create" ? "Menyimpan data..." : "Memperbarui data..."}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button form="master-item-form" type="submit" loading={submitting}>
            Simpan
          </Button>
        </div>
      }
    >
      <form id="master-item-form" className="space-y-4" onSubmit={handleSubmit}>
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

        {showCategory ? (
          <Select
            label="Category"
            name="category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            options={categoryOptions[tab]}
            placeholder="Pilih category"
            error={fieldErrors.category}
            disabled={submitting}
            required
          />
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Unit"
            name="unit"
            value={unit}
            onChange={(event) => setUnit(event.target.value)}
            error={fieldErrors.unit}
            disabled={submitting}
            required
          />
          <Input
            label="Default Price"
            name="default_price"
            type="number"
            min={0}
            value={defaultPrice}
            onChange={(event) => setDefaultPrice(event.target.value)}
            error={fieldErrors.default_price}
            disabled={submitting}
            placeholder="Optional"
          />
        </div>
      </form>
    </Modal>
  );
}
