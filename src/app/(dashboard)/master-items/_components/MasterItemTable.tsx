"use client";

import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

import { DataTable, IconButton } from "@/ui/components";
import { formatCurrencyIDR } from "@/ui/utils/format";

import { AccommodationItem, ConsumptionItem, LogisticItem, MasterTab } from "../_hooks/useMasterItems";

type ItemLike = LogisticItem | ConsumptionItem | AccommodationItem;

type MasterItemTableProps = {
  tab: MasterTab;
  items: ItemLike[];
  loading: boolean;
  canEdit: boolean;
  onEdit: (item: ItemLike) => void;
  onDelete: (item: ItemLike) => void;
};

export function MasterItemTable({ tab, items, loading, canEdit, onEdit, onDelete }: MasterItemTableProps) {
  return (
    <DataTable
      data={items}
      loading={loading}
      rowKey={(item) => item.id}
      searchPlaceholder="Cari master item..."
      emptyTitle="Belum ada data"
      emptyDescription="Tambahkan item master untuk digunakan di trip."
      columns={[
        {
          id: "title",
          header: "Title",
          accessor: (item) => item.title,
          cell: (item) => <span className="font-medium text-slate-900">{item.title}</span>,
        },
        ...(tab !== "logistics"
          ? [
              {
                id: "category",
                header: "Category",
                accessor: (item: ItemLike) => ("category" in item ? item.category : "-"),
              },
            ]
          : []),
        {
          id: "unit",
          header: "Unit",
          accessor: (item) => item.unit,
        },
        {
          id: "default-price",
          header: "Default Price",
          accessor: (item) => item.defaultPrice ?? 0,
          numeric: true,
          cell: (item) => (item.defaultPrice ? formatCurrencyIDR(item.defaultPrice) : "-"),
        },
        {
          id: "actions",
          header: "Actions",
          searchable: false,
          align: "right",
          className: "w-32",
          cell: (item) =>
            canEdit ? (
              <div className="flex items-center justify-end gap-2">
                <IconButton aria-label="Edit item" onClick={() => onEdit(item)}>
                  <PencilSquareIcon className="h-4 w-4" />
                </IconButton>
                <IconButton tone="danger" aria-label="Hapus item" onClick={() => onDelete(item)}>
                  <TrashIcon className="h-4 w-4" />
                </IconButton>
              </div>
            ) : (
              <span className="text-xs text-slate-500">Read only</span>
            ),
        },
      ]}
    />
  );
}
