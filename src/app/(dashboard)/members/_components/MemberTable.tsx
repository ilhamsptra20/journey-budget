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

import type { Member } from "../_hooks/useMembers";

type MemberTableProps = {
  members: Member[];
  loading: boolean;
  canEdit: boolean;
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
};

export function MemberTable({ members, loading, canEdit, onEdit, onDelete }: MemberTableProps) {
  if (loading) {
    return (
      <div className="flex h-24 items-center justify-center">
        <Spinner className="h-5 w-5" />
      </div>
    );
  }

  if (members.length === 0) {
    return <EmptyState title="Belum ada member" description="Tambahkan anggota untuk mulai mencatat trip." />;
  }

  return (
    <TableContainer>
      <Table>
        <THead>
          <tr>
            <TH>Nama</TH>
            <TH className="w-32">Actions</TH>
          </tr>
        </THead>
        <TBody>
          {members.map((member) => (
            <TR key={member.id}>
              <TD className="font-medium text-slate-900">{member.name}</TD>
              <TD>
                {canEdit ? (
                  <div className="flex items-center gap-2">
                    <IconButton aria-label="Edit member" onClick={() => onEdit(member)}>
                      <PencilSquareIcon className="h-4 w-4" />
                    </IconButton>
                    <IconButton tone="danger" aria-label="Hapus member" onClick={() => onDelete(member)}>
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
