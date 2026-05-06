"use client";

import { useMemo, useState } from "react";

import { Alert, Button, PageHeader, Tabs } from "@/ui/components";
import { useAuth } from "@/ui/providers/AuthProvider";
import { confirmDelete, showError, showSuccess } from "@/ui/utils/swal";

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
    const confirmed = await confirmDelete({
      title: "Hapus data?",
      text: `Data item "${item.title}" yang dihapus tidak bisa dikembalikan.`,
    });
    if (!confirmed) {
      return;
    }

    try {
      await deleteItem(item.id);
      await showSuccess("Data berhasil dihapus");
    } catch (caughtError) {
      await showError(caughtError instanceof Error ? caughtError.message : "Gagal menghapus item");
    }
  };

  return (
    <div className="min-w-0 space-y-5 overflow-x-hidden">
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
            try {
              await updateItem(editing.id, payload);
              await showSuccess("Data berhasil diperbarui");
            } catch (caughtError) {
              await showError(caughtError instanceof Error ? caughtError.message : "Gagal memperbarui item");
              throw caughtError;
            }
            return;
          }

          try {
            await createItem(payload);
            await showSuccess("Data berhasil ditambahkan");
          } catch (caughtError) {
            await showError(caughtError instanceof Error ? caughtError.message : "Gagal menambah item");
            throw caughtError;
          }
        }}
      />
    </div>
  );
}
