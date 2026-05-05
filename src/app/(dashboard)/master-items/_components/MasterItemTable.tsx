"use client";

import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

import {
  EmptyState,
  IconButton,
  Spinner,
  Table,
  TableContainer,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/ui/components";
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
  if (loading) {
    return (
      <div className="flex h-24 items-center justify-center">
        <Spinner className="h-5 w-5" />
      </div>
    );
  }

  if (items.length === 0) {
    return <EmptyState title="Belum ada data" description="Tambahkan item master untuk digunakan di trip." />;
  }

  return (
    <TableContainer>
      <Table>
        <THead>
          <tr>
            <TH>Title</TH>
            {tab !== "logistics" ? <TH>Category</TH> : null}
            <TH>Unit</TH>
            <TH>Default Price</TH>
            <TH className="w-28">Actions</TH>
          </tr>
        </THead>
        <TBody>
          {items.map((item) => (
            <TR key={item.id}>
              <TD className="font-medium text-slate-900">{item.title}</TD>
              {tab !== "logistics" ? <TD>{"category" in item ? item.category : "-"}</TD> : null}
              <TD>{item.unit}</TD>
              <TD>{item.defaultPrice ? formatCurrencyIDR(item.defaultPrice) : "-"}</TD>
              <TD>
                {canEdit ? (
                  <div className="flex items-center gap-2">
                    <IconButton aria-label="Edit item" onClick={() => onEdit(item)}>
                      <PencilSquareIcon className="h-4 w-4" />
                    </IconButton>
                    <IconButton tone="danger" aria-label="Hapus item" onClick={() => onDelete(item)}>
                      <TrashIcon className="h-4 w-4" />
                    </IconButton>
                  </div>
                ) : (
                  <span className="text-xs text-slate-500">Read only</span>
                )}
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </TableContainer>
  );
}
