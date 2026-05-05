"use client";

import { useMemo, useState } from "react";

import { ApiClientError } from "@/ui/api/client";
import { Alert, Button, PageHeader, Tabs } from "@/ui/components";
import { useAuth } from "@/ui/providers/AuthProvider";

import { MasterItemFormModal } from "./_components/MasterItemFormModal";
import { MasterItemTable } from "./_components/MasterItemTable";
import {
  AccommodationItem,
  ConsumptionItem,
  LogisticItem,
  MasterTab,
  useMasterItems,
} from "./_hooks/useMasterItems";

type ItemLike = LogisticItem | ConsumptionItem | AccommodationItem;

export default function MasterItemsPage() {
  const { user } = useAuth();
  const canEdit = user?.role === "admin" || user?.role === "user";

  const [tab, setTab] = useState<MasterTab>("logistics");
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<ItemLike | null>(null);
  const [actionError, setActionError] = useState("");

  const { items, loading, error, createItem, updateItem, deleteItem } = useMasterItems(tab);

  const tabItems = useMemo(
    () => [
      { key: "logistics", label: "Logistics" },
      { key: "consumptions", label: "Consumptions" },
      { key: "accommodations", label: "Accommodations" },
    ],
    [],
  );

  const handleDelete = async (item: ItemLike) => {
    const confirmed = window.confirm(`Hapus item \"${item.title}\"?`);
    if (!confirmed) {
      return;
    }

    setActionError("");

    try {
      await deleteItem(item.id);
    } catch (caughtError) {
      if (caughtError instanceof ApiClientError) {
        setActionError(caughtError.message);
      } else {
        setActionError("Gagal menghapus item");
      }
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Master Items"
        description="Kelola master item logistics, consumptions, dan accommodations"
        action={
          canEdit ? (
            <Button
              onClick={() => {
                setEditing(null);
                setOpenForm(true);
              }}
            >
              Add Item
            </Button>
          ) : null
        }
      />

      <Tabs items={tabItems} value={tab} onChange={(next) => setTab(next as MasterTab)} />

      {error ? <Alert tone="danger">{error}</Alert> : null}
      {actionError ? <Alert tone="danger">{actionError}</Alert> : null}

      <MasterItemTable
        tab={tab}
        items={items}
        loading={loading}
        canEdit={canEdit}
        onEdit={(item) => {
          setEditing(item);
          setOpenForm(true);
        }}
        onDelete={handleDelete}
      />

      <MasterItemFormModal
        open={openForm}
        mode={editing ? "edit" : "create"}
        tab={tab}
        initialData={editing}
        onClose={() => {
          setEditing(null);
          setOpenForm(false);
        }}
        onSubmit={async (payload) => {
          if (editing) {
            await updateItem(editing.id, payload);
            return;
          }

          await createItem(payload);
        }}
      />
    </div>
  );
}
