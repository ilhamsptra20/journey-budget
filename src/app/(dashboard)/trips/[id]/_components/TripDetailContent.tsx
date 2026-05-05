"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

import { ApiClientError } from "@/ui/api/client";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  EmptyState,
  IconButton,
  Input,
  Modal,
  PageHeader,
  Select,
  Spinner,
  StatCard,
  Table,
  TableContainer,
  Tabs,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Textarea,
} from "@/ui/components";
import { useAuth } from "@/ui/providers/AuthProvider";
import { formatCurrencyIDR, formatDate } from "@/ui/utils/format";
import { mapValidationErrors } from "@/ui/utils/validation";

import {
  FundPayload,
  FundRow,
  TripAccommodationPayload,
  TripAccommodationRow,
  TripConsumptionPayload,
  TripConsumptionRow,
  TripLogisticPayload,
  TripLogisticRow,
  useTripDetail,
} from "../_hooks/useTripDetail";

type TripDetailContentProps = {
  tripId: string;
};

type TabKey =
  | "overview"
  | "members"
  | "logistics"
  | "consumptions"
  | "accommodations"
  | "funds"
  | "summary";

const tabItems = [
  { key: "overview", label: "Overview" },
  { key: "members", label: "Anggota" },
  { key: "logistics", label: "Logistik" },
  { key: "consumptions", label: "Konsumsi" },
  { key: "accommodations", label: "Akomodasi" },
  { key: "funds", label: "Dana" },
  { key: "summary", label: "Ringkasan" },
];

export function TripDetailContent({ tripId }: TripDetailContentProps) {
  const { user } = useAuth();
  const canEdit = user?.role === "admin" || user?.role === "user";

  const {
    trip,
    tripMembers,
    allMembers,
    summary,
    logisticItems,
    consumptionItems,
    accommodationItems,
    tripLogistics,
    tripConsumptions,
    tripAccommodations,
    funds,
    memberMap,
    loading,
    error,
    addTripMember,
    removeTripMember,
    createTripLogistic,
    updateTripLogistic,
    deleteTripLogistic,
    createTripConsumption,
    updateTripConsumption,
    deleteTripConsumption,
    createTripAccommodation,
    updateTripAccommodation,
    deleteTripAccommodation,
    createFund,
    updateFund,
    deleteFund,
  } = useTripDetail(tripId);

  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [actionError, setActionError] = useState("");

  const [openMemberModal, setOpenMemberModal] = useState(false);
  const [openLogisticModal, setOpenLogisticModal] = useState(false);
  const [openConsumptionModal, setOpenConsumptionModal] = useState(false);
  const [openAccommodationModal, setOpenAccommodationModal] = useState(false);
  const [openFundModal, setOpenFundModal] = useState(false);

  const [editingLogistic, setEditingLogistic] = useState<TripLogisticRow | null>(null);
  const [editingConsumption, setEditingConsumption] = useState<TripConsumptionRow | null>(null);
  const [editingAccommodation, setEditingAccommodation] = useState<TripAccommodationRow | null>(null);
  const [editingFund, setEditingFund] = useState<FundRow | null>(null);

  const availableMembers = useMemo(() => {
    const existing = new Set(tripMembers.map((member) => member.member_id));
    return allMembers.filter((member) => !existing.has(member.id));
  }, [allMembers, tripMembers]);

  const handleDelete = async (
    label: string,
    action: () => Promise<void>,
  ) => {
    const confirmed = window.confirm(`Hapus ${label}?`);
    if (!confirmed) {
      return;
    }

    setActionError("");

    try {
      await action();
    } catch (caughtError) {
      if (caughtError instanceof ApiClientError) {
        setActionError(caughtError.message);
      } else {
        setActionError(caughtError instanceof Error ? caughtError.message : "Aksi gagal");
      }
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title={trip ? `Trip: ${trip.title}` : "Trip Detail"}
        description={trip ? `${trip.location} • ${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}` : "Memuat detail trip"}
      />

      {error ? <Alert tone="danger">{error}</Alert> : null}
      {actionError ? <Alert tone="danger">{actionError}</Alert> : null}

      <Tabs items={tabItems} value={activeTab} onChange={(key) => setActiveTab(key as TabKey)} />

      {loading ? (
        <div className="flex h-24 items-center justify-center">
          <Spinner className="h-5 w-5" />
        </div>
      ) : null}

      {!loading && activeTab === "overview" ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Expense" value={formatCurrencyIDR(summary?.expenses.total ?? 0)} />
            <StatCard label="Total Kolektif" value={formatCurrencyIDR(summary?.funds.kolektif ?? 0)} />
            <StatCard label="Total Donatur" value={formatCurrencyIDR(summary?.funds.donatur ?? 0)} />
            <StatCard label="Saldo Trip" value={formatCurrencyIDR(summary?.saldo_trip ?? 0)} />
          </div>
          <Card>
            <CardContent>
              <p className="text-sm text-slate-600">
                Pantau progres budgeting dari tab Anggota, Expense, Dana, dan Ringkasan.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {!loading && activeTab === "members" ? (
        <div className="space-y-4">
          {canEdit ? (
            <div className="flex justify-end">
              <Button onClick={() => setOpenMemberModal(true)}>
                <PlusIcon className="h-4 w-4" />
                Tambah Anggota
              </Button>
            </div>
          ) : null}

          {tripMembers.length === 0 ? (
            <EmptyState title="Belum ada anggota trip" description="Tambahkan anggota untuk pembagian biaya." />
          ) : (
            <TableContainer>
              <Table>
                <THead>
                  <tr>
                    <TH>Nama</TH>
                    <TH className="w-28">Actions</TH>
                  </tr>
                </THead>
                <TBody>
                  {tripMembers.map((member) => (
                    <TR key={member.id}>
                      <TD className="font-medium text-slate-900">{member.member_name}</TD>
                      <TD>
                        {canEdit ? (
                          <IconButton
                            tone="danger"
                            onClick={() =>
                              void handleDelete(`anggota ${member.member_name}`, () =>
                                removeTripMember(member.member_id),
                              )
                            }
                          >
                            <TrashIcon className="h-4 w-4" />
                          </IconButton>
                        ) : (
                          <span className="text-xs text-slate-500">Read only</span>
                        )}
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </TableContainer>
          )}
        </div>
      ) : null}

      {!loading && activeTab === "logistics" ? (
        <ExpenseSection
          title="Trip Logistics"
          canEdit={canEdit}
          onAdd={() => {
            setEditingLogistic(null);
            setOpenLogisticModal(true);
          }}
          isEmpty={tripLogistics.length === 0}
          emptyTitle="Belum ada logistic expense"
          table={
            <TableContainer>
              <Table>
                <THead>
                  <tr>
                    <TH>Item</TH>
                    <TH>Acquisition</TH>
                    <TH>Scope</TH>
                    <TH>Cost Type</TH>
                    <TH>Price</TH>
                    <TH>Count</TH>
                    <TH>Duration</TH>
                    <TH className="w-28">Actions</TH>
                  </tr>
                </THead>
                <TBody>
                  {tripLogistics.map((row) => (
                    <TR key={row.id}>
                      <TD>{logisticItems.find((item) => item.id === row.logisticItemId)?.title ?? "-"}</TD>
                      <TD>{row.acquisitionType}</TD>
                      <TD>{row.scope}</TD>
                      <TD>{row.costType}</TD>
                      <TD>{row.price ? formatCurrencyIDR(row.price) : "-"}</TD>
                      <TD>{row.count}</TD>
                      <TD>{row.duration ?? "-"}</TD>
                      <TD>
                        {canEdit ? (
                          <div className="flex gap-2">
                            <IconButton
                              onClick={() => {
                                setEditingLogistic(row);
                                setOpenLogisticModal(true);
                              }}
                            >
                              <PencilSquareIcon className="h-4 w-4" />
                            </IconButton>
                            <IconButton
                              tone="danger"
                              onClick={() =>
                                void handleDelete("logistic expense", () => deleteTripLogistic(row.id))
                              }
                            >
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
          }
        />
      ) : null}

      {!loading && activeTab === "consumptions" ? (
        <ExpenseSection
          title="Trip Consumptions"
          canEdit={canEdit}
          onAdd={() => {
            setEditingConsumption(null);
            setOpenConsumptionModal(true);
          }}
          isEmpty={tripConsumptions.length === 0}
          emptyTitle="Belum ada consumption expense"
          table={
            <TableContainer>
              <Table>
                <THead>
                  <tr>
                    <TH>Item</TH>
                    <TH>Time</TH>
                    <TH>Scope</TH>
                    <TH>Price</TH>
                    <TH>Count</TH>
                    <TH className="w-28">Actions</TH>
                  </tr>
                </THead>
                <TBody>
                  {tripConsumptions.map((row) => (
                    <TR key={row.id}>
                      <TD>{consumptionItems.find((item) => item.id === row.consumptionItemId)?.title ?? "-"}</TD>
                      <TD>{row.time}</TD>
                      <TD>{row.scope}</TD>
                      <TD>{formatCurrencyIDR(row.price)}</TD>
                      <TD>{row.count}</TD>
                      <TD>
                        {canEdit ? (
                          <div className="flex gap-2">
                            <IconButton
                              onClick={() => {
                                setEditingConsumption(row);
                                setOpenConsumptionModal(true);
                              }}
                            >
                              <PencilSquareIcon className="h-4 w-4" />
                            </IconButton>
                            <IconButton
                              tone="danger"
                              onClick={() =>
                                void handleDelete("consumption expense", () =>
                                  deleteTripConsumption(row.id),
                                )
                              }
                            >
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
          }
        />
      ) : null}

      {!loading && activeTab === "accommodations" ? (
        <ExpenseSection
          title="Trip Accommodations"
          canEdit={canEdit}
          onAdd={() => {
            setEditingAccommodation(null);
            setOpenAccommodationModal(true);
          }}
          isEmpty={tripAccommodations.length === 0}
          emptyTitle="Belum ada accommodation expense"
          table={
            <TableContainer>
              <Table>
                <THead>
                  <tr>
                    <TH>Item</TH>
                    <TH>Scope</TH>
                    <TH>Price</TH>
                    <TH>Count</TH>
                    <TH className="w-28">Actions</TH>
                  </tr>
                </THead>
                <TBody>
                  {tripAccommodations.map((row) => (
                    <TR key={row.id}>
                      <TD>{accommodationItems.find((item) => item.id === row.accommodationItemId)?.title ?? "-"}</TD>
                      <TD>{row.scope}</TD>
                      <TD>{formatCurrencyIDR(row.price)}</TD>
                      <TD>{row.count}</TD>
                      <TD>
                        {canEdit ? (
                          <div className="flex gap-2">
                            <IconButton
                              onClick={() => {
                                setEditingAccommodation(row);
                                setOpenAccommodationModal(true);
                              }}
                            >
                              <PencilSquareIcon className="h-4 w-4" />
                            </IconButton>
                            <IconButton
                              tone="danger"
                              onClick={() =>
                                void handleDelete("accommodation expense", () =>
                                  deleteTripAccommodation(row.id),
                                )
                              }
                            >
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
          }
        />
      ) : null}

      {!loading && activeTab === "funds" ? (
        <div className="space-y-5">
          {canEdit ? (
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setEditingFund(null);
                  setOpenFundModal(true);
                }}
              >
                <PlusIcon className="h-4 w-4" />
                Tambah Dana
              </Button>
            </div>
          ) : null}

          <FundTable
            title="Kolektif"
            type="kolektif"
            rows={funds.filter((row) => row.type === "kolektif")}
            canEdit={canEdit}
            memberMap={memberMap}
            onEdit={(row) => {
              setEditingFund(row);
              setOpenFundModal(true);
            }}
            onDelete={(row) =>
              void handleDelete("dana kolektif", () => deleteFund(row.id))
            }
          />

          <FundTable
            title="Donatur"
            type="donatur"
            rows={funds.filter((row) => row.type === "donatur")}
            canEdit={canEdit}
            memberMap={memberMap}
            onEdit={(row) => {
              setEditingFund(row);
              setOpenFundModal(true);
            }}
            onDelete={(row) =>
              void handleDelete("dana donatur", () => deleteFund(row.id))
            }
          />
        </div>
      ) : null}

      {!loading && activeTab === "summary" ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Biaya" value={formatCurrencyIDR(summary?.expenses.total ?? 0)} />
            <StatCard label="Total Donatur" value={formatCurrencyIDR(summary?.funds.donatur ?? 0)} />
            <StatCard label="Total Kolektif" value={formatCurrencyIDR(summary?.funds.kolektif ?? 0)} />
            <StatCard label="Saldo Trip" value={formatCurrencyIDR(summary?.saldo_trip ?? 0)} />
          </div>

          <TableContainer>
            <Table>
              <THead>
                <tr>
                  <TH>Nama</TH>
                  <TH>Tagihan</TH>
                  <TH>Bayar</TH>
                  <TH>Sisa</TH>
                  <TH>Status</TH>
                </tr>
              </THead>
              <TBody>
                {summary?.members.map((member) => (
                  <TR key={member.member_id}>
                    <TD className="font-medium text-slate-900">{member.name}</TD>
                    <TD>{formatCurrencyIDR(member.tagihan)}</TD>
                    <TD>{formatCurrencyIDR(member.bayar)}</TD>
                    <TD>{formatCurrencyIDR(member.sisa)}</TD>
                    <TD>
                      <Badge
                        tone={
                          member.status === "paid"
                            ? "success"
                            : member.status === "partial"
                              ? "warning"
                              : "danger"
                        }
                      >
                        {member.status}
                      </Badge>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </TableContainer>
        </div>
      ) : null}

      <AddTripMemberModal
        open={openMemberModal}
        onClose={() => setOpenMemberModal(false)}
        members={availableMembers}
        onSubmit={async (memberId) => {
          try {
            await addTripMember(memberId);
            setOpenMemberModal(false);
          } catch (caughtError) {
            if (caughtError instanceof ApiClientError) {
              setActionError(caughtError.message);
            } else {
              setActionError("Gagal menambah anggota trip");
            }
          }
        }}
      />

      <TripLogisticModal
        open={openLogisticModal}
        onClose={() => {
          setOpenLogisticModal(false);
          setEditingLogistic(null);
        }}
        items={logisticItems}
        initialData={editingLogistic}
        onSubmit={async (payload) => {
          if (editingLogistic) {
            await updateTripLogistic(editingLogistic.id, payload);
          } else {
            await createTripLogistic(payload as TripLogisticPayload);
          }

          setOpenLogisticModal(false);
          setEditingLogistic(null);
        }}
      />

      <TripConsumptionModal
        open={openConsumptionModal}
        onClose={() => {
          setOpenConsumptionModal(false);
          setEditingConsumption(null);
        }}
        items={consumptionItems}
        initialData={editingConsumption}
        onSubmit={async (payload) => {
          if (editingConsumption) {
            await updateTripConsumption(editingConsumption.id, payload);
          } else {
            await createTripConsumption(payload as TripConsumptionPayload);
          }

          setOpenConsumptionModal(false);
          setEditingConsumption(null);
        }}
      />

      <TripAccommodationModal
        open={openAccommodationModal}
        onClose={() => {
          setOpenAccommodationModal(false);
          setEditingAccommodation(null);
        }}
        items={accommodationItems}
        initialData={editingAccommodation}
        onSubmit={async (payload) => {
          if (editingAccommodation) {
            await updateTripAccommodation(editingAccommodation.id, payload);
          } else {
            await createTripAccommodation(payload as TripAccommodationPayload);
          }

          setOpenAccommodationModal(false);
          setEditingAccommodation(null);
        }}
      />

      <FundModal
        open={openFundModal}
        onClose={() => {
          setOpenFundModal(false);
          setEditingFund(null);
        }}
        members={tripMembers.map((member) => ({
          value: member.member_id,
          label: member.member_name,
        }))}
        initialData={editingFund}
        onSubmit={async (payload) => {
          if (editingFund) {
            await updateFund(editingFund.id, payload);
          } else {
            await createFund(payload as FundPayload);
          }

          setOpenFundModal(false);
          setEditingFund(null);
        }}
      />
    </div>
  );
}

type ExpenseSectionProps = {
  title: string;
  canEdit: boolean;
  onAdd: () => void;
  isEmpty: boolean;
  emptyTitle: string;
  table: React.ReactNode;
};

function ExpenseSection({ title, canEdit, onAdd, isEmpty, emptyTitle, table }: ExpenseSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {canEdit ? (
          <Button onClick={onAdd}>
            <PlusIcon className="h-4 w-4" />
            Add
          </Button>
        ) : null}
      </div>
      {isEmpty ? <EmptyState title={emptyTitle} /> : table}
    </div>
  );
}

type AddTripMemberModalProps = {
  open: boolean;
  onClose: () => void;
  members: Array<{ id: string; name: string }>;
  onSubmit: (memberId: string) => Promise<void>;
};

function AddTripMemberModal({ open, onClose, members, onSubmit }: AddTripMemberModalProps) {
  const [memberId, setMemberId] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const memberOptions = members.map((member) => ({
    value: member.id,
    label: member.name,
  }));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!memberId) {
      setError("Pilih member terlebih dahulu");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await onSubmit(memberId);
      setMemberId("");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Gagal menambah anggota");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tambah Anggota"
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" form="add-member-form" isLoading={submitting}>
            {submitting ? <Spinner /> : null}
            Simpan
          </Button>
        </div>
      }
    >
      <form id="add-member-form" className="space-y-4" onSubmit={handleSubmit}>
        {error ? <Alert tone="danger">{error}</Alert> : null}
        {members.length === 0 ? (
          <Alert tone="warning">Semua member sudah masuk trip ini.</Alert>
        ) : (
          <Select
            label="Member"
            value={memberId}
            onChange={(event) => setMemberId(event.target.value)}
            options={memberOptions}
            placeholder="Pilih member"
          />
        )}
      </form>
    </Modal>
  );
}

type TripLogisticModalProps = {
  open: boolean;
  onClose: () => void;
  items: Array<{ id: string; title: string }>;
  initialData: TripLogisticRow | null;
  onSubmit: (payload: TripLogisticPayload | Partial<TripLogisticPayload>) => Promise<void>;
};

function TripLogisticModal({ open, onClose, items, initialData, onSubmit }: TripLogisticModalProps) {
  const [form, setForm] = useState<TripLogisticPayload>({
    logistic_item_id: "",
    acquisition_type: "beli",
    scope: "group",
    cost_type: "paid",
    price: 0,
    count: 1,
    duration: null,
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        logistic_item_id: "",
        acquisition_type: "beli",
        scope: "group",
        cost_type: "paid",
        price: 0,
        count: 1,
        duration: null,
      });
      setError("");
      setFieldErrors({});
      return;
    }

    setForm({
      logistic_item_id: initialData.logisticItemId,
      acquisition_type: initialData.acquisitionType,
      scope: initialData.scope,
      cost_type: initialData.costType,
      price: initialData.price,
      count: initialData.count,
      duration: initialData.duration,
    });
    setError("");
    setFieldErrors({});
  }, [open, initialData]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setFieldErrors({});

    try {
      await onSubmit(form);
    } catch (caughtError) {
      if (caughtError instanceof ApiClientError) {
        setError(caughtError.message);
        setFieldErrors(mapValidationErrors(caughtError.details));
      } else {
        setError(caughtError instanceof Error ? caughtError.message : "Gagal menyimpan data");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialData ? "Edit Logistic Expense" : "Tambah Logistic Expense"}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Batal
          </Button>
          <Button form="trip-logistic-form" type="submit" isLoading={submitting}>
            {submitting ? <Spinner /> : null}
            Simpan
          </Button>
        </div>
      }
    >
      <form id="trip-logistic-form" className="space-y-4" onSubmit={handleSubmit}>
        {error ? <Alert tone="danger">{error}</Alert> : null}
        <Select
          label="Logistic Item"
          value={form.logistic_item_id}
          onChange={(event) => setForm((prev) => ({ ...prev, logistic_item_id: event.target.value }))}
          options={items.map((item) => ({ value: item.id, label: item.title }))}
          placeholder="Pilih item"
          error={fieldErrors.logistic_item_id}
          required
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Acquisition Type"
            value={form.acquisition_type}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                acquisition_type: event.target.value as TripLogisticPayload["acquisition_type"],
              }))
            }
            options={[
              { value: "beli", label: "beli" },
              { value: "sewa", label: "sewa" },
              { value: "bawa_sendiri", label: "bawa_sendiri" },
              { value: "pinjam", label: "pinjam" },
            ]}
          />
          <Select
            label="Scope"
            value={form.scope}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                scope: event.target.value as TripLogisticPayload["scope"],
              }))
            }
            options={[
              { value: "group", label: "group" },
              { value: "personal", label: "personal" },
            ]}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Cost Type"
            value={form.cost_type}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                cost_type: event.target.value as TripLogisticPayload["cost_type"],
              }))
            }
            options={[
              { value: "paid", label: "paid" },
              { value: "free", label: "free" },
            ]}
          />
          <Input
            label="Price"
            type="number"
            min={0}
            value={form.price ?? 0}
            onChange={(event) => setForm((prev) => ({ ...prev, price: Number(event.target.value) }))}
            error={fieldErrors.price}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Count"
            type="number"
            min={1}
            value={form.count}
            onChange={(event) => setForm((prev) => ({ ...prev, count: Number(event.target.value) }))}
            error={fieldErrors.count}
            required
          />
          <Input
            label="Duration"
            type="number"
            min={1}
            value={form.duration ?? ""}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                duration: event.target.value ? Number(event.target.value) : null,
              }))
            }
            error={fieldErrors.duration}
          />
        </div>
      </form>
    </Modal>
  );
}

type TripConsumptionModalProps = {
  open: boolean;
  onClose: () => void;
  items: Array<{ id: string; title: string }>;
  initialData: TripConsumptionRow | null;
  onSubmit: (payload: TripConsumptionPayload | Partial<TripConsumptionPayload>) => Promise<void>;
};

function TripConsumptionModal({ open, onClose, items, initialData, onSubmit }: TripConsumptionModalProps) {
  const [form, setForm] = useState<TripConsumptionPayload>({
    consumption_item_id: "",
    time: "pagi",
    scope: "group",
    price: 0,
    count: 1,
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        consumption_item_id: "",
        time: "pagi",
        scope: "group",
        price: 0,
        count: 1,
      });
      setError("");
      setFieldErrors({});
      return;
    }

    setForm({
      consumption_item_id: initialData.consumptionItemId,
      time: initialData.time,
      scope: initialData.scope,
      price: initialData.price,
      count: initialData.count,
    });
    setError("");
    setFieldErrors({});
  }, [open, initialData]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setFieldErrors({});

    try {
      await onSubmit(form);
    } catch (caughtError) {
      if (caughtError instanceof ApiClientError) {
        setError(caughtError.message);
        setFieldErrors(mapValidationErrors(caughtError.details));
      } else {
        setError(caughtError instanceof Error ? caughtError.message : "Gagal menyimpan data");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialData ? "Edit Consumption Expense" : "Tambah Consumption Expense"}
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" form="trip-consumption-form" isLoading={submitting}>
            {submitting ? <Spinner /> : null}
            Simpan
          </Button>
        </div>
      }
    >
      <form id="trip-consumption-form" className="space-y-4" onSubmit={handleSubmit}>
        {error ? <Alert tone="danger">{error}</Alert> : null}
        <Select
          label="Consumption Item"
          value={form.consumption_item_id}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, consumption_item_id: event.target.value }))
          }
          options={items.map((item) => ({ value: item.id, label: item.title }))}
          placeholder="Pilih item"
          error={fieldErrors.consumption_item_id}
          required
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Time"
            value={form.time}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                time: event.target.value as TripConsumptionPayload["time"],
              }))
            }
            options={[
              { value: "pagi", label: "pagi" },
              { value: "siang", label: "siang" },
              { value: "malam", label: "malam" },
              { value: "perjalanan", label: "perjalanan" },
              { value: "camp", label: "camp" },
              { value: "summit", label: "summit" },
              { value: "other", label: "other" },
            ]}
          />
          <Select
            label="Scope"
            value={form.scope}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                scope: event.target.value as TripConsumptionPayload["scope"],
              }))
            }
            options={[
              { value: "group", label: "group" },
              { value: "personal", label: "personal" },
            ]}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Price"
            type="number"
            min={0}
            value={form.price}
            onChange={(event) => setForm((prev) => ({ ...prev, price: Number(event.target.value) }))}
            error={fieldErrors.price}
            required
          />
          <Input
            label="Count"
            type="number"
            min={1}
            value={form.count}
            onChange={(event) => setForm((prev) => ({ ...prev, count: Number(event.target.value) }))}
            error={fieldErrors.count}
            required
          />
        </div>
      </form>
    </Modal>
  );
}

type TripAccommodationModalProps = {
  open: boolean;
  onClose: () => void;
  items: Array<{ id: string; title: string }>;
  initialData: TripAccommodationRow | null;
  onSubmit: (payload: TripAccommodationPayload | Partial<TripAccommodationPayload>) => Promise<void>;
};

function TripAccommodationModal({ open, onClose, items, initialData, onSubmit }: TripAccommodationModalProps) {
  const [form, setForm] = useState<TripAccommodationPayload>({
    accommodation_item_id: "",
    scope: "group",
    price: 0,
    count: 1,
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        accommodation_item_id: "",
        scope: "group",
        price: 0,
        count: 1,
      });
      setError("");
      setFieldErrors({});
      return;
    }

    setForm({
      accommodation_item_id: initialData.accommodationItemId,
      scope: initialData.scope,
      price: initialData.price,
      count: initialData.count,
    });
    setError("");
    setFieldErrors({});
  }, [open, initialData]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setFieldErrors({});

    try {
      await onSubmit(form);
    } catch (caughtError) {
      if (caughtError instanceof ApiClientError) {
        setError(caughtError.message);
        setFieldErrors(mapValidationErrors(caughtError.details));
      } else {
        setError(caughtError instanceof Error ? caughtError.message : "Gagal menyimpan data");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialData ? "Edit Accommodation Expense" : "Tambah Accommodation Expense"}
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" form="trip-accommodation-form" isLoading={submitting}>
            {submitting ? <Spinner /> : null}
            Simpan
          </Button>
        </div>
      }
    >
      <form id="trip-accommodation-form" className="space-y-4" onSubmit={handleSubmit}>
        {error ? <Alert tone="danger">{error}</Alert> : null}
        <Select
          label="Accommodation Item"
          value={form.accommodation_item_id}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, accommodation_item_id: event.target.value }))
          }
          options={items.map((item) => ({ value: item.id, label: item.title }))}
          placeholder="Pilih item"
          error={fieldErrors.accommodation_item_id}
          required
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Scope"
            value={form.scope}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                scope: event.target.value as TripAccommodationPayload["scope"],
              }))
            }
            options={[
              { value: "group", label: "group" },
              { value: "personal", label: "personal" },
            ]}
          />
          <Input
            label="Price"
            type="number"
            min={0}
            value={form.price}
            onChange={(event) => setForm((prev) => ({ ...prev, price: Number(event.target.value) }))}
            error={fieldErrors.price}
            required
          />
        </div>

        <Input
          label="Count"
          type="number"
          min={1}
          value={form.count}
          onChange={(event) => setForm((prev) => ({ ...prev, count: Number(event.target.value) }))}
          error={fieldErrors.count}
          required
        />
      </form>
    </Modal>
  );
}

type FundTableProps = {
  title: string;
  type: "kolektif" | "donatur";
  rows: FundRow[];
  canEdit: boolean;
  memberMap: Map<string, string>;
  onEdit: (row: FundRow) => void;
  onDelete: (row: FundRow) => void;
};

function FundTable({ title, type, rows, canEdit, memberMap, onEdit, onDelete }: FundTableProps) {
  return (
    <div className="space-y-2">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {rows.length === 0 ? (
        <EmptyState title={`Belum ada dana ${title.toLowerCase()}`} />
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <tr>
                {type === "kolektif" ? <TH>Member</TH> : <TH>Source</TH>}
                <TH>Amount</TH>
                <TH>Method</TH>
                <TH>Paid At</TH>
                <TH>Note</TH>
                <TH className="w-28">Actions</TH>
              </tr>
            </THead>
            <TBody>
              {rows.map((row) => (
                <TR key={row.id}>
                  <TD>{type === "kolektif" ? memberMap.get(row.memberId ?? "") ?? "-" : row.sourceName ?? "-"}</TD>
                  <TD>{formatCurrencyIDR(row.amount)}</TD>
                  <TD>{row.method ?? "-"}</TD>
                  <TD>{formatDate(row.paidAt)}</TD>
                  <TD>{row.note ?? "-"}</TD>
                  <TD>
                    {canEdit ? (
                      <div className="flex gap-2">
                        <IconButton onClick={() => onEdit(row)}>
                          <PencilSquareIcon className="h-4 w-4" />
                        </IconButton>
                        <IconButton tone="danger" onClick={() => onDelete(row)}>
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
      )}
    </div>
  );
}

type FundModalProps = {
  open: boolean;
  onClose: () => void;
  members: Array<{ value: string; label: string }>;
  initialData: FundRow | null;
  onSubmit: (payload: FundPayload | Partial<FundPayload>) => Promise<void>;
};

function FundModal({ open, onClose, members, initialData, onSubmit }: FundModalProps) {
  const [form, setForm] = useState<FundPayload>({
    type: "kolektif",
    member_id: null,
    source_name: null,
    amount: 0,
    paid_at: null,
    method: null,
    note: null,
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        type: "kolektif",
        member_id: null,
        source_name: null,
        amount: 0,
        paid_at: null,
        method: null,
        note: null,
      });
      setError("");
      setFieldErrors({});
      return;
    }

    setForm({
      type: initialData.type,
      member_id: initialData.memberId,
      source_name: initialData.sourceName,
      amount: initialData.amount,
      paid_at: initialData.paidAt,
      method: initialData.method,
      note: initialData.note,
    });
    setError("");
    setFieldErrors({});
  }, [open, initialData]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setFieldErrors({});

    try {
      await onSubmit(form);
    } catch (caughtError) {
      if (caughtError instanceof ApiClientError) {
        setError(caughtError.message);
        setFieldErrors(mapValidationErrors(caughtError.details));
      } else {
        setError(caughtError instanceof Error ? caughtError.message : "Gagal menyimpan dana");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isKolektif = form.type === "kolektif";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialData ? "Edit Dana" : "Tambah Dana"}
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" form="fund-form" isLoading={submitting}>
            {submitting ? <Spinner /> : null}
            Simpan
          </Button>
        </div>
      }
    >
      <form id="fund-form" className="space-y-4" onSubmit={handleSubmit}>
        {error ? <Alert tone="danger">{error}</Alert> : null}
        <Select
          label="Type"
          value={form.type}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              type: event.target.value as FundPayload["type"],
              member_id: event.target.value === "kolektif" ? prev.member_id : null,
              source_name: event.target.value === "donatur" ? prev.source_name : null,
            }))
          }
          options={[
            { value: "kolektif", label: "kolektif" },
            { value: "donatur", label: "donatur" },
          ]}
        />

        {isKolektif ? (
          <Select
            label="Member"
            value={form.member_id ?? ""}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                member_id: event.target.value || null,
              }))
            }
            options={members}
            placeholder="Pilih member"
            error={fieldErrors.member_id}
            required
          />
        ) : (
          <Input
            label="Source Name"
            value={form.source_name ?? ""}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                source_name: event.target.value || null,
              }))
            }
            error={fieldErrors.source_name}
            required
          />
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Amount"
            type="number"
            min={0}
            value={form.amount}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                amount: Number(event.target.value),
              }))
            }
            error={fieldErrors.amount}
            required
          />
          <Input
            label="Paid At"
            type="datetime-local"
            value={toDateTimeInput(form.paid_at)}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                paid_at: event.target.value ? new Date(event.target.value).toISOString() : null,
              }))
            }
            error={fieldErrors.paid_at}
          />
        </div>

        <Input
          label="Method"
          value={form.method ?? ""}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              method: event.target.value || null,
            }))
          }
          error={fieldErrors.method}
        />

        <Textarea
          label="Note"
          value={form.note ?? ""}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              note: event.target.value || null,
            }))
          }
          error={fieldErrors.note}
        />
      </form>
    </Modal>
  );
}

function toDateTimeInput(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const tzOffset = date.getTimezoneOffset() * 60000;
  const localISO = new Date(date.getTime() - tzOffset).toISOString();
  return localISO.slice(0, 16);
}
