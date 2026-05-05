"use client";

import { useState } from "react";

import { ApiClientError } from "@/ui/api/client";
import { Alert, Button, PageHeader } from "@/ui/components";
import { useAuth } from "@/ui/providers/AuthProvider";

import { MemberFormModal } from "./_components/MemberFormModal";
import { MemberTable } from "./_components/MemberTable";
import { Member, useMembers } from "./_hooks/useMembers";

export default function MembersPage() {
  const { user } = useAuth();
  const canEdit = user?.role === "admin" || user?.role === "user";

  const { members, loading, error, createMember, updateMember, deleteMember } = useMembers();

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [actionError, setActionError] = useState("");

  const handleDelete = async (member: Member) => {
    const confirmed = window.confirm(`Hapus member \"${member.name}\"?`);
    if (!confirmed) {
      return;
    }

    setActionError("");

    try {
      await deleteMember(member.id);
    } catch (caughtError) {
      if (caughtError instanceof ApiClientError) {
        setActionError(caughtError.message);
      } else {
        setActionError("Gagal menghapus member");
      }
    }
  };

  return (
    <div className="space-y-5">
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
      {actionError ? <Alert tone="danger">{actionError}</Alert> : null}

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
            await updateMember(editing.id, payload);
            return;
          }

          await createMember(payload);
        }}
      />
    </div>
  );
}
