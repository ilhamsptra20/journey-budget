"use client";

import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

import { DataTable, IconButton } from "@/ui/components";

import type { Member } from "../_hooks/useMembers";

type MemberTableProps = {
  members: Member[];
  loading: boolean;
  canEdit: boolean;
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
};

export function MemberTable({ members, loading, canEdit, onEdit, onDelete }: MemberTableProps) {
  return (
    <DataTable
      data={members}
      loading={loading}
      rowKey={(member) => member.id}
      searchPlaceholder="Cari member..."
      emptyTitle="Belum ada member"
      emptyDescription="Tambahkan anggota untuk mulai mencatat trip."
      columns={[
        {
          id: "name",
          header: "Nama",
          accessor: (member) => member.name,
          cell: (member) => <span className="font-medium text-slate-900">{member.name}</span>,
        },
        {
          id: "actions",
          header: "Actions",
          searchable: false,
          align: "right",
          className: "w-32",
          cell: (member) =>
            canEdit ? (
              <div className="flex items-center justify-end gap-2">
                <IconButton aria-label="Edit member" onClick={() => onEdit(member)}>
                  <PencilSquareIcon className="h-4 w-4" />
                </IconButton>
                <IconButton tone="danger" aria-label="Hapus member" onClick={() => onDelete(member)}>
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
