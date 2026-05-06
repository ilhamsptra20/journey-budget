"use client";

import { useState } from "react";

import { Alert, Button, PageHeader } from "@/ui/components";
import { useAuth } from "@/ui/providers/AuthProvider";
import { confirmDelete, showError, showSuccess } from "@/ui/utils/swal";

import { MemberFormModal } from "./_components/MemberFormModal";
import { MemberTable } from "./_components/MemberTable";
import { Member, useMembers } from "./_hooks/useMembers";

export default function MembersPage() {
  const { user } = useAuth();
  const canEdit = user?.role === "admin" || user?.role === "user";

  const { members, loading, error, createMember, updateMember, deleteMember } = useMembers();

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const handleDelete = async (member: Member) => {
    const confirmed = await confirmDelete({
      title: "Hapus data?",
      text: `Data member "${member.name}" yang dihapus tidak bisa dikembalikan.`,
    });
    if (!confirmed) {
      return;
    }

    try {
      await deleteMember(member.id);
      await showSuccess("Data berhasil dihapus");
    } catch (caughtError) {
      await showError(caughtError instanceof Error ? caughtError.message : "Gagal menghapus member");
    }
  };

  return (
    <div className="min-w-0 space-y-5 overflow-x-hidden">
      <PageHeader
        title="Members"
        description="Kelola daftar anggota untuk kebutuhan trip"
        action={
          canEdit ? (
            <Button
              onClick={() => {
                setEditing(null);
                setOpenForm(true);
              }}
            >
              Add Member
            </Button>
          ) : null
        }
      />

      {error ? <Alert tone="danger">{error}</Alert> : null}

      <MemberTable
        members={members}
        loading={loading}
        canEdit={canEdit}
        onEdit={(member) => {
          setEditing(member);
          setOpenForm(true);
        }}
        onDelete={handleDelete}
      />

      <MemberFormModal
        open={openForm}
        mode={editing ? "edit" : "create"}
        initialData={editing}
        onClose={() => {
          setEditing(null);
          setOpenForm(false);
        }}
        onSubmit={async (payload) => {
          if (editing) {
            try {
              await updateMember(editing.id, payload);
              await showSuccess("Data berhasil diperbarui");
            } catch (caughtError) {
              await showError(caughtError instanceof Error ? caughtError.message : "Gagal memperbarui member");
              throw caughtError;
            }
            return;
          }

          try {
            await createMember(payload);
            await showSuccess("Data berhasil ditambahkan");
          } catch (caughtError) {
            await showError(caughtError instanceof Error ? caughtError.message : "Gagal menambah member");
            throw caughtError;
          }
        }}
      />
    </div>
  );
}
