"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowPathIcon,
  ClipboardDocumentIcon,
  LinkIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

import { ApiClientError } from "@/ui/api/client";
import {
  Alert,
  Autocomplete,
  AutocompleteOption,
  Badge,
  Button,
  DataTable,
  EmptyState,
  IconButton,
  Input,
  Modal,
  PageHeader,
  ParticipantPicker,
  ParticipantOption,
  Select,
  Spinner,
  StatCard,
  Tabs,
  Textarea,
} from "@/ui/components";
import { useAuth } from "@/ui/providers/AuthProvider";
import { formatCurrencyIDR, formatDate } from "@/ui/utils/format";
import { mapValidationErrors } from "@/ui/utils/validation";

import {
  AccommodationItem,
  ConsumptionItem,
  ExpenseType,
  FundPayload,
  FundRow,
  LogisticItem,
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

type ExpenseFormCommon = {
  scope: "group" | "personal";
  participantIds: string[];
};

type LogisticFormValues = ExpenseFormCommon & {
  item: AutocompleteOption | null;
  acquisition_type: "beli" | "sewa" | "bawa_sendiri" | "pinjam";
  cost_type: "paid" | "free";
  price: string;
  count: string;
  duration: string;
};

type ConsumptionFormValues = ExpenseFormCommon & {
  item: AutocompleteOption | null;
  time: "pagi" | "siang" | "malam" | "perjalanan" | "camp" | "summit" | "other";
  price: string;
  count: string;
};

type AccommodationFormValues = ExpenseFormCommon & {
  item: AutocompleteOption | null;
  price: string;
  count: string;
};

const tabItems = [
  { key: "overview", label: "Overview" },
  { key: "members", label: "Anggota" },
  { key: "logistics", label: "Logistik" },
  { key: "consumptions", label: "Konsumsi" },
  { key: "accommodations", label: "Akomodasi" },
  { key: "funds", label: "Dana" },
  { key: "summary", label: "Ringkasan" },
];

const defaultLogisticForm = (): LogisticFormValues => ({
  item: null,
  acquisition_type: "beli",
  scope: "group",
  cost_type: "paid",
  price: "",
  count: "1",
  duration: "",
  participantIds: [],
});

const defaultConsumptionForm = (): ConsumptionFormValues => ({
  item: null,
  time: "pagi",
  scope: "group",
  price: "",
  count: "1",
  participantIds: [],
});

const defaultAccommodationForm = (): AccommodationFormValues => ({
  item: null,
  scope: "group",
  price: "",
  count: "1",
  participantIds: [],
});

function parseNumber(value: string) {
  const next = Number(value);
  if (!Number.isFinite(next)) {
    return null;
  }

  return next;
}

function toOption<TMeta>(value: string, label: string, meta?: TMeta): AutocompleteOption {
  return { value, label, meta };
}

function getOptionMeta<TMeta>(option: AutocompleteOption | null): TMeta | null {
  if (!option || !option.meta) {
    return null;
  }

  return option.meta as TMeta;
}

function participantIdsFromMap(
  getter: (expenseType: ExpenseType, expenseId: string) => string[],
  expenseType: ExpenseType,
  expenseId: string,
) {
  return getter(expenseType, expenseId);
}

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
    createLogisticMasterItem,
    createConsumptionMasterItem,
    createAccommodationMasterItem,
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
    enablePublicReport,
    regeneratePublicReport,
    disablePublicReport,
    getExpenseParticipantsMemberIds,
  } = useTripDetail(tripId);

  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [actionError, setActionError] = useState("");
  const [publicShareLink, setPublicShareLink] = useState("");
  const [publicShareNotice, setPublicShareNotice] = useState("");
  const [publicShareLoading, setPublicShareLoading] = useState(false);

  const [openMemberModal, setOpenMemberModal] = useState(false);
  const [openLogisticModal, setOpenLogisticModal] = useState(false);
  const [openConsumptionModal, setOpenConsumptionModal] = useState(false);
  const [openAccommodationModal, setOpenAccommodationModal] = useState(false);
  const [openFundModal, setOpenFundModal] = useState(false);

  const [editingLogistic, setEditingLogistic] = useState<TripLogisticRow | null>(null);
  const [editingConsumption, setEditingConsumption] = useState<TripConsumptionRow | null>(null);
  const [editingAccommodation, setEditingAccommodation] = useState<TripAccommodationRow | null>(null);
  const [editingFund, setEditingFund] = useState<FundRow | null>(null);

  const memberOptions = useMemo<ParticipantOption[]>(
    () =>
      tripMembers.map((member) => ({
        value: member.member_id,
        label: member.member_name,
      })),
    [tripMembers],
  );

  const availableMembers = useMemo(() => {
    const existing = new Set(tripMembers.map((member) => member.member_id));
    return allMembers.filter((member) => !existing.has(member.id));
  }, [allMembers, tripMembers]);

  const logisticOptions = useMemo(
    () => logisticItems.map((item) => toOption(item.id, item.title, item)),
    [logisticItems],
  );
  const consumptionOptions = useMemo(
    () => consumptionItems.map((item) => toOption(item.id, item.title, item)),
    [consumptionItems],
  );
  const accommodationOptions = useMemo(
    () => accommodationItems.map((item) => toOption(item.id, item.title, item)),
    [accommodationItems],
  );

  const copyTextToClipboard = async (text: string) => {
    if (!text || typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  };

  const handleEnablePublicReport = async (copyAfterEnable = false) => {
    setActionError("");
    setPublicShareNotice("");
    setPublicShareLoading(true);

    try {
      const result = await enablePublicReport();
      const link = result.share_link ?? "";
      setPublicShareLink(link);

      if (copyAfterEnable && link) {
        const copied = await copyTextToClipboard(link);
        setPublicShareNotice(copied ? "Link report berhasil disalin." : "Link report siap dibagikan.");
      } else {
        setPublicShareNotice("Public report berhasil diaktifkan.");
      }
    } catch (caughtError) {
      if (caughtError instanceof ApiClientError) {
        setActionError(caughtError.message);
      } else {
        setActionError(caughtError instanceof Error ? caughtError.message : "Gagal mengaktifkan public report");
      }
    } finally {
      setPublicShareLoading(false);
    }
  };

  const handleRegeneratePublicReport = async () => {
    setActionError("");
    setPublicShareNotice("");
    setPublicShareLoading(true);

    try {
      const result = await regeneratePublicReport();
      const link = result.share_link ?? "";
      setPublicShareLink(link);
      const copied = link ? await copyTextToClipboard(link) : false;
      setPublicShareNotice(
        copied
          ? "Token berhasil diperbarui dan link baru disalin."
          : "Token berhasil diperbarui. Bagikan link baru.",
      );
    } catch (caughtError) {
      if (caughtError instanceof ApiClientError) {
        setActionError(caughtError.message);
      } else {
        setActionError(caughtError instanceof Error ? caughtError.message : "Gagal memperbarui token");
      }
    } finally {
      setPublicShareLoading(false);
    }
  };

  const handleDisablePublicReport = async () => {
    setActionError("");
    setPublicShareNotice("");
    setPublicShareLoading(true);

    try {
      await disablePublicReport();
      setPublicShareLink("");
      setPublicShareNotice("Public report dinonaktifkan.");
    } catch (caughtError) {
      if (caughtError instanceof ApiClientError) {
        setActionError(caughtError.message);
      } else {
        setActionError(caughtError instanceof Error ? caughtError.message : "Gagal menonaktifkan public report");
      }
    } finally {
      setPublicShareLoading(false);
    }
  };

  const handleCopyPublicReportLink = async () => {
    if (publicShareLink) {
      const copied = await copyTextToClipboard(publicShareLink);
      setPublicShareNotice(copied ? "Link report berhasil disalin." : "Link report siap dibagikan.");
      return;
    }

    await handleEnablePublicReport(true);
  };

  const handleDelete = async (label: string, action: () => Promise<unknown>) => {
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

  useEffect(() => {
    if (!trip?.publicReportEnabled && publicShareLink) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPublicShareLink("");
    }
  }, [trip?.publicReportEnabled, publicShareLink]);

  return (
    <div className="space-y-5">
      <PageHeader
        title={trip ? `Trip: ${trip.title}` : "Trip Detail"}
        description={
          trip
            ? `${trip.location} • ${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}`
            : "Memuat detail trip"
        }
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
          <Alert tone="info">
            Detail biaya, pendanaan, dan pembagian tagihan tersedia di masing-masing tab.
          </Alert>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Public Report</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Bagikan ringkasan trip read-only tanpa login menggunakan link token.
                </p>
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <span>Public Report</span>
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  checked={Boolean(trip?.publicReportEnabled)}
                  disabled={!canEdit || publicShareLoading}
                  onChange={(event) => {
                    if (!canEdit || publicShareLoading) {
                      return;
                    }

                    if (event.target.checked) {
                      void handleEnablePublicReport(false);
                      return;
                    }

                    void handleDisablePublicReport();
                  }}
                />
              </label>
            </div>

            {canEdit ? (
              <div className="mt-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {!trip?.publicReportEnabled ? (
                    <Button
                      type="button"
                      size="sm"
                      isLoading={publicShareLoading}
                      disabled={publicShareLoading}
                      onClick={() => void handleEnablePublicReport(true)}
                    >
                      <LinkIcon className="h-4 w-4" />
                      Generate Share Link
                    </Button>
                  ) : (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        isLoading={publicShareLoading}
                        disabled={publicShareLoading}
                        onClick={() => void handleCopyPublicReportLink()}
                      >
                        <ClipboardDocumentIcon className="h-4 w-4" />
                        Copy Link
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        isLoading={publicShareLoading}
                        disabled={publicShareLoading}
                        onClick={() => void handleRegeneratePublicReport()}
                      >
                        <ArrowPathIcon className="h-4 w-4" />
                        Regenerate Token
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        isLoading={publicShareLoading}
                        disabled={publicShareLoading}
                        onClick={() => void handleDisablePublicReport()}
                      >
                        <TrashIcon className="h-4 w-4" />
                        Disable Public Report
                      </Button>
                    </>
                  )}
                </div>

                {publicShareLink ? (
                  <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                    <p className="text-xs text-slate-500">Share Link</p>
                    <p className="mt-1 break-all text-sm text-slate-800">{publicShareLink}</p>
                  </div>
                ) : null}

                {publicShareNotice ? <Alert tone="success">{publicShareNotice}</Alert> : null}
              </div>
            ) : (
              <div className="mt-4">
                <ReadonlyHint />
              </div>
            )}
          </div>
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
          ) : (
            <ReadonlyHint />
          )}

          <DataTable
            data={tripMembers}
            rowKey={(row) => row.id}
            loading={false}
            searchPlaceholder="Cari anggota trip..."
            emptyTitle="Belum ada anggota trip"
            emptyDescription="Tambahkan anggota untuk pembagian biaya."
            columns={[
              {
                id: "name",
                header: "Nama",
                accessor: (row) => row.member_name,
                cell: (row) => <span className="font-medium text-slate-900">{row.member_name}</span>,
              },
              {
                id: "actions",
                header: "Actions",
                searchable: false,
                align: "right",
                className: "w-24",
                cell: (row) =>
                  canEdit ? (
                    <div className="flex justify-end">
                      <IconButton
                        tone="danger"
                        onClick={() =>
                          void handleDelete(`anggota ${row.member_name}`, () =>
                            removeTripMember(row.member_id),
                          )
                        }
                      >
                        <TrashIcon className="h-4 w-4" />
                      </IconButton>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">Read only</span>
                  ),
              },
            ]}
          />
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
        >
          <DataTable
            data={tripLogistics}
            rowKey={(row) => row.id}
            searchPlaceholder="Cari expense logistics..."
            emptyTitle="Belum ada logistic expense"
            columns={[
              {
                id: "item",
                header: "Item",
                accessor: (row) =>
                  logisticItems.find((item) => item.id === row.logisticItemId)?.title ?? "-",
                cell: (row) => (
                  <span className="font-medium text-slate-900">
                    {logisticItems.find((item) => item.id === row.logisticItemId)?.title ?? "-"}
                  </span>
                ),
              },
              { id: "acquisition", header: "Acquisition", accessor: (row) => row.acquisitionType },
              { id: "scope", header: "Scope", accessor: (row) => row.scope },
              { id: "cost", header: "Cost Type", accessor: (row) => row.costType },
              {
                id: "price",
                header: "Price",
                accessor: (row) => row.price ?? 0,
                numeric: true,
                cell: (row) => (row.price ? formatCurrencyIDR(row.price) : "-"),
              },
              { id: "count", header: "Count", accessor: (row) => row.count, numeric: true },
              { id: "duration", header: "Duration", accessor: (row) => row.duration ?? 0, numeric: true, cell: (row) => row.duration ?? "-" },
              {
                id: "actions",
                header: "Actions",
                searchable: false,
                align: "right",
                className: "w-28",
                cell: (row) =>
                  canEdit ? (
                    <div className="flex justify-end gap-2">
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
                  ),
              },
            ]}
          />
        </ExpenseSection>
      ) : null}

      {!loading && activeTab === "consumptions" ? (
        <ExpenseSection
          title="Trip Consumptions"
          canEdit={canEdit}
          onAdd={() => {
            setEditingConsumption(null);
            setOpenConsumptionModal(true);
          }}
        >
          <DataTable
            data={tripConsumptions}
            rowKey={(row) => row.id}
            searchPlaceholder="Cari expense konsumsi..."
            emptyTitle="Belum ada consumption expense"
            columns={[
              {
                id: "item",
                header: "Item",
                accessor: (row) =>
                  consumptionItems.find((item) => item.id === row.consumptionItemId)?.title ?? "-",
                cell: (row) => (
                  <span className="font-medium text-slate-900">
                    {consumptionItems.find((item) => item.id === row.consumptionItemId)?.title ?? "-"}
                  </span>
                ),
              },
              { id: "time", header: "Time", accessor: (row) => row.time },
              { id: "scope", header: "Scope", accessor: (row) => row.scope },
              {
                id: "price",
                header: "Price",
                accessor: (row) => row.price,
                numeric: true,
                cell: (row) => formatCurrencyIDR(row.price),
              },
              { id: "count", header: "Count", accessor: (row) => row.count, numeric: true },
              {
                id: "actions",
                header: "Actions",
                searchable: false,
                align: "right",
                className: "w-28",
                cell: (row) =>
                  canEdit ? (
                    <div className="flex justify-end gap-2">
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
                          void handleDelete("consumption expense", () => deleteTripConsumption(row.id))
                        }
                      >
                        <TrashIcon className="h-4 w-4" />
                      </IconButton>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">Read only</span>
                  ),
              },
            ]}
          />
        </ExpenseSection>
      ) : null}

      {!loading && activeTab === "accommodations" ? (
        <ExpenseSection
          title="Trip Accommodations"
          canEdit={canEdit}
          onAdd={() => {
            setEditingAccommodation(null);
            setOpenAccommodationModal(true);
          }}
        >
          <DataTable
            data={tripAccommodations}
            rowKey={(row) => row.id}
            searchPlaceholder="Cari expense akomodasi..."
            emptyTitle="Belum ada accommodation expense"
            columns={[
              {
                id: "item",
                header: "Item",
                accessor: (row) =>
                  accommodationItems.find((item) => item.id === row.accommodationItemId)?.title ?? "-",
                cell: (row) => (
                  <span className="font-medium text-slate-900">
                    {accommodationItems.find((item) => item.id === row.accommodationItemId)?.title ?? "-"}
                  </span>
                ),
              },
              { id: "scope", header: "Scope", accessor: (row) => row.scope },
              {
                id: "price",
                header: "Price",
                accessor: (row) => row.price,
                numeric: true,
                cell: (row) => formatCurrencyIDR(row.price),
              },
              { id: "count", header: "Count", accessor: (row) => row.count, numeric: true },
              {
                id: "actions",
                header: "Actions",
                searchable: false,
                align: "right",
                className: "w-28",
                cell: (row) =>
                  canEdit ? (
                    <div className="flex justify-end gap-2">
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
                          void handleDelete("accommodation expense", () => deleteTripAccommodation(row.id))
                        }
                      >
                        <TrashIcon className="h-4 w-4" />
                      </IconButton>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">Read only</span>
                  ),
              },
            ]}
          />
        </ExpenseSection>
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
          ) : (
            <ReadonlyHint />
          )}

          <FundTable
            title="Kolektif"
            rows={funds.filter((row) => row.type === "kolektif")}
            memberMap={memberMap}
            canEdit={canEdit}
            onEdit={(row) => {
              setEditingFund(row);
              setOpenFundModal(true);
            }}
            onDelete={(row) => void handleDelete("dana kolektif", () => deleteFund(row.id))}
          />

          <FundTable
            title="Donatur"
            rows={funds.filter((row) => row.type === "donatur")}
            memberMap={memberMap}
            canEdit={canEdit}
            onEdit={(row) => {
              setEditingFund(row);
              setOpenFundModal(true);
            }}
            onDelete={(row) => void handleDelete("dana donatur", () => deleteFund(row.id))}
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

          <DataTable
            data={summary?.members ?? []}
            rowKey={(row) => row.member_id}
            searchPlaceholder="Cari anggota ringkasan..."
            emptyTitle="Belum ada ringkasan"
            columns={[
              {
                id: "name",
                header: "Nama",
                accessor: (row) => row.name,
                cell: (row) => <span className="font-medium text-slate-900">{row.name}</span>,
              },
              {
                id: "tagihan",
                header: "Tagihan",
                accessor: (row) => row.tagihan,
                numeric: true,
                cell: (row) => formatCurrencyIDR(row.tagihan),
              },
              {
                id: "bayar",
                header: "Bayar",
                accessor: (row) => row.bayar,
                numeric: true,
                cell: (row) => formatCurrencyIDR(row.bayar),
              },
              {
                id: "sisa",
                header: "Sisa",
                accessor: (row) => row.sisa,
                numeric: true,
                cell: (row) => formatCurrencyIDR(row.sisa),
              },
              {
                id: "status",
                header: "Status",
                accessor: (row) => row.status,
                cell: (row) => (
                  <Badge
                    tone={
                      row.status === "paid"
                        ? "success"
                        : row.status === "partial"
                          ? "warning"
                          : "danger"
                    }
                  >
                    {row.status}
                  </Badge>
                ),
              },
            ]}
          />
        </div>
      ) : null}

      <AddTripMemberModal
        open={openMemberModal}
        members={availableMembers}
        onClose={() => setOpenMemberModal(false)}
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
        initialData={editingLogistic}
        options={logisticOptions}
        memberOptions={memberOptions}
        initialParticipantIds={
          editingLogistic
            ? participantIdsFromMap(
                getExpenseParticipantsMemberIds,
                "trip_logistics",
                editingLogistic.id,
              )
            : []
        }
        onClose={() => {
          setOpenLogisticModal(false);
          setEditingLogistic(null);
        }}
        onCreateMasterItem={async (keyword) => {
          const created = await createLogisticMasterItem(keyword);
          return toOption(created.id, created.title, created);
        }}
        onSubmit={async (payload, participantIds) => {
          if (editingLogistic) {
            await updateTripLogistic(editingLogistic.id, payload, participantIds);
          } else {
            await createTripLogistic(payload as TripLogisticPayload, participantIds);
          }
          setOpenLogisticModal(false);
          setEditingLogistic(null);
        }}
      />

      <TripConsumptionModal
        open={openConsumptionModal}
        initialData={editingConsumption}
        options={consumptionOptions}
        memberOptions={memberOptions}
        initialParticipantIds={
          editingConsumption
            ? participantIdsFromMap(
                getExpenseParticipantsMemberIds,
                "trip_consumptions",
                editingConsumption.id,
              )
            : []
        }
        onClose={() => {
          setOpenConsumptionModal(false);
          setEditingConsumption(null);
        }}
        onCreateMasterItem={async (keyword) => {
          const created = await createConsumptionMasterItem(keyword);
          return toOption(created.id, created.title, created);
        }}
        onSubmit={async (payload, participantIds) => {
          if (editingConsumption) {
            await updateTripConsumption(editingConsumption.id, payload, participantIds);
          } else {
            await createTripConsumption(payload as TripConsumptionPayload, participantIds);
          }
          setOpenConsumptionModal(false);
          setEditingConsumption(null);
        }}
      />

      <TripAccommodationModal
        open={openAccommodationModal}
        initialData={editingAccommodation}
        options={accommodationOptions}
        memberOptions={memberOptions}
        initialParticipantIds={
          editingAccommodation
            ? participantIdsFromMap(
                getExpenseParticipantsMemberIds,
                "trip_accommodations",
                editingAccommodation.id,
              )
            : []
        }
        onClose={() => {
          setOpenAccommodationModal(false);
          setEditingAccommodation(null);
        }}
        onCreateMasterItem={async (keyword) => {
          const created = await createAccommodationMasterItem(keyword);
          return toOption(created.id, created.title, created);
        }}
        onSubmit={async (payload, participantIds) => {
          if (editingAccommodation) {
            await updateTripAccommodation(editingAccommodation.id, payload, participantIds);
          } else {
            await createTripAccommodation(payload as TripAccommodationPayload, participantIds);
          }
          setOpenAccommodationModal(false);
          setEditingAccommodation(null);
        }}
      />

      <FundModal
        open={openFundModal}
        initialData={editingFund}
        memberOptions={memberOptions}
        onClose={() => {
          setOpenFundModal(false);
          setEditingFund(null);
        }}
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

function ReadonlyHint() {
  return <Alert tone="info">Role guest hanya bisa melihat data (read-only).</Alert>;
}

function ExpenseSection({
  title,
  canEdit,
  onAdd,
  children,
}: {
  title: string;
  canEdit: boolean;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {canEdit ? (
          <Button onClick={onAdd}>
            <PlusIcon className="h-4 w-4" />
            Add
          </Button>
        ) : (
          <ReadonlyHint />
        )}
      </div>
      {children}
    </div>
  );
}

function AddTripMemberModal({
  open,
  onClose,
  members,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  members: Array<{ id: string; name: string }>;
  onSubmit: (memberId: string) => Promise<void>;
}) {
  const [memberId, setMemberId] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMemberId("");
      setError("");
      setSubmitting(false);
    }
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tambah Anggota"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Batal
          </Button>
          <Button
            type="button"
            isLoading={submitting}
            disabled={!memberId}
            onClick={async () => {
              setError("");
              setSubmitting(true);

              try {
                await onSubmit(memberId);
              } catch (caughtError) {
                setError(caughtError instanceof Error ? caughtError.message : "Gagal menambah anggota");
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {submitting ? <Spinner /> : null}
            Simpan
          </Button>
        </div>
      }
    >
      {error ? <Alert tone="danger">{error}</Alert> : null}
      {members.length === 0 ? (
        <EmptyState title="Semua member sudah tergabung" description="Tidak ada member tersisa untuk ditambahkan." />
      ) : (
        <Select
          label="Member"
          value={memberId}
          onChange={(event) => setMemberId(event.target.value)}
          options={members.map((member) => ({ value: member.id, label: member.name }))}
          placeholder="Pilih member"
        />
      )}
    </Modal>
  );
}

function TripLogisticModal({
  open,
  onClose,
  options,
  memberOptions,
  initialData,
  initialParticipantIds,
  onCreateMasterItem,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  options: AutocompleteOption[];
  memberOptions: ParticipantOption[];
  initialData: TripLogisticRow | null;
  initialParticipantIds: string[];
  onCreateMasterItem: (keyword: string) => Promise<AutocompleteOption>;
  onSubmit: (payload: Partial<TripLogisticPayload>, participantIds: string[]) => Promise<void>;
}) {
  const [form, setForm] = useState<LogisticFormValues>(defaultLogisticForm);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(defaultLogisticForm());
      setError("");
      setFieldErrors({});
      return;
    }

    if (!initialData) {
      setForm(defaultLogisticForm());
      setError("");
      setFieldErrors({});
      return;
    }

    const selectedOption = options.find((option) => option.value === initialData.logisticItemId) ?? null;

    setForm({
      item: selectedOption,
      acquisition_type: initialData.acquisitionType,
      scope: initialData.scope,
      cost_type: initialData.costType,
      price: initialData.price !== null ? String(initialData.price) : "",
      count: String(initialData.count),
      duration: initialData.duration !== null ? String(initialData.duration) : "",
      participantIds: initialParticipantIds,
    });
    setError("");
    setFieldErrors({});
  }, [open, initialData, initialParticipantIds, options]);

  const selectedLogisticItem = getOptionMeta<LogisticItem>(form.item);
  const isSewa = form.acquisition_type === "sewa";
  const isPaid = form.cost_type === "paid";
  const priceHint = !isPaid
    ? selectedLogisticItem
      ? "Item ini tidak dihitung ke total biaya. Terisi otomatis dari master item, masih bisa diubah."
      : "Item ini tidak dihitung ke total biaya."
    : selectedLogisticItem
      ? "Terisi otomatis dari master item, masih bisa diubah."
      : undefined;

  const handleLogisticItemChange = (item: AutocompleteOption | null) => {
    setForm((prev) => {
      if (!item) {
        return { ...prev, item: null, price: "" };
      }

      if (prev.item?.value === item.value) {
        return { ...prev, item };
      }

      const nextMasterItem = getOptionMeta<LogisticItem>(item);
      return {
        ...prev,
        item,
        price:
          nextMasterItem?.defaultPrice !== null && nextMasterItem?.defaultPrice !== undefined
            ? String(nextMasterItem.defaultPrice)
            : "",
      };
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    setFieldErrors({});

    const count = parseNumber(form.count);
    const duration = parseNumber(form.duration);
    const price = parseNumber(form.price);

    if (!form.item) {
      setFieldErrors({ logistic_item_id: "Pilih item terlebih dahulu" });
      setSubmitting(false);
      return;
    }

    if (!count || count < 1) {
      setFieldErrors({ count: "Count minimal 1" });
      setSubmitting(false);
      return;
    }

    if (isSewa && (!duration || duration < 1)) {
      setFieldErrors({ duration: "Duration wajib diisi saat sewa" });
      setSubmitting(false);
      return;
    }

    if (isPaid && (price === null || price < 0)) {
      setFieldErrors({ price: "Price wajib dan tidak boleh negatif" });
      setSubmitting(false);
      return;
    }

    if (form.scope === "personal" && form.participantIds.length === 0) {
      setFieldErrors({ participants: "Participants wajib untuk scope personal" });
      setSubmitting(false);
      return;
    }

    const payload: TripLogisticPayload = {
      logistic_item_id: form.item.value,
      acquisition_type: form.acquisition_type,
      scope: form.scope,
      cost_type: form.cost_type,
      price: isPaid ? price : 0,
      count,
      duration: isSewa ? duration : null,
    };

    try {
      await onSubmit(payload, form.participantIds);
    } catch (caughtError) {
      if (caughtError instanceof ApiClientError) {
        setError(caughtError.message);
        setFieldErrors(mapValidationErrors(caughtError.details));
      } else {
        setError(caughtError instanceof Error ? caughtError.message : "Gagal menyimpan logistic expense");
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
          <Button type="button" isLoading={submitting} disabled={submitting} onClick={() => void handleSubmit()}>
            {submitting ? <Spinner /> : null}
            Simpan
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {error ? <Alert tone="danger">{error}</Alert> : null}

        <Autocomplete
          label="Logistic Item"
          value={form.item}
          options={options}
          onChange={handleLogisticItemChange}
          onCreateOption={onCreateMasterItem}
          createText={(keyword) => `Buat item baru: ${keyword}`}
          error={fieldErrors.logistic_item_id}
        />

        <Input
          label="Unit (Master)"
          value={selectedLogisticItem?.unit ?? "-"}
          disabled
          readOnly
        />

        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Acquisition Type"
            value={form.acquisition_type}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                acquisition_type: event.target.value as LogisticFormValues["acquisition_type"],
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
                scope: event.target.value as LogisticFormValues["scope"],
              }))
            }
            options={[
              { value: "group", label: "group" },
              { value: "personal", label: "personal" },
            ]}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Cost Type"
            value={form.cost_type}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                cost_type: event.target.value as LogisticFormValues["cost_type"],
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
            disabled={!isPaid}
            value={form.price}
            onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
            error={fieldErrors.price}
            hint={priceHint}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Count"
            type="number"
            min={1}
            value={form.count}
            onChange={(event) => setForm((prev) => ({ ...prev, count: event.target.value }))}
            error={fieldErrors.count}
          />
          {isSewa ? (
            <Input
              label="Duration"
              type="number"
              min={1}
              value={form.duration}
              onChange={(event) => setForm((prev) => ({ ...prev, duration: event.target.value }))}
              error={fieldErrors.duration}
            />
          ) : null}
        </div>

        <ParticipantPicker
          label="Participants"
          options={memberOptions}
          value={form.participantIds}
          onChange={(participantIds) => setForm((prev) => ({ ...prev, participantIds }))}
          error={fieldErrors.participants}
          hint={
            form.scope === "group"
              ? "Kosongkan jika semua anggota ikut. Isi jika hanya sebagian anggota ikut."
              : "Wajib pilih minimal satu participant untuk scope personal."
          }
        />
      </div>
    </Modal>
  );
}

function TripConsumptionModal({
  open,
  onClose,
  options,
  memberOptions,
  initialData,
  initialParticipantIds,
  onCreateMasterItem,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  options: AutocompleteOption[];
  memberOptions: ParticipantOption[];
  initialData: TripConsumptionRow | null;
  initialParticipantIds: string[];
  onCreateMasterItem: (keyword: string) => Promise<AutocompleteOption>;
  onSubmit: (payload: Partial<TripConsumptionPayload>, participantIds: string[]) => Promise<void>;
}) {
  const [form, setForm] = useState<ConsumptionFormValues>(defaultConsumptionForm);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(defaultConsumptionForm());
      setError("");
      setFieldErrors({});
      return;
    }

    if (!initialData) {
      setForm(defaultConsumptionForm());
      setError("");
      setFieldErrors({});
      return;
    }

    const selectedOption = options.find((option) => option.value === initialData.consumptionItemId) ?? null;

    setForm({
      item: selectedOption,
      time: initialData.time,
      scope: initialData.scope,
      price: String(initialData.price),
      count: String(initialData.count),
      participantIds: initialParticipantIds,
    });
    setError("");
    setFieldErrors({});
  }, [open, initialData, initialParticipantIds, options]);

  const selectedConsumptionItem = getOptionMeta<ConsumptionItem>(form.item);

  const handleConsumptionItemChange = (item: AutocompleteOption | null) => {
    setForm((prev) => {
      if (!item) {
        return { ...prev, item: null, price: "" };
      }

      if (prev.item?.value === item.value) {
        return { ...prev, item };
      }

      const nextMasterItem = getOptionMeta<ConsumptionItem>(item);
      return {
        ...prev,
        item,
        price:
          nextMasterItem?.defaultPrice !== null && nextMasterItem?.defaultPrice !== undefined
            ? String(nextMasterItem.defaultPrice)
            : "",
      };
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    setFieldErrors({});

    const price = parseNumber(form.price);
    const count = parseNumber(form.count);

    if (!form.item) {
      setFieldErrors({ consumption_item_id: "Pilih item terlebih dahulu" });
      setSubmitting(false);
      return;
    }

    if (price === null || price < 0) {
      setFieldErrors({ price: "Price tidak valid" });
      setSubmitting(false);
      return;
    }

    if (!count || count < 1) {
      setFieldErrors({ count: "Count minimal 1" });
      setSubmitting(false);
      return;
    }

    if (form.scope === "personal" && form.participantIds.length === 0) {
      setFieldErrors({ participants: "Participants wajib untuk scope personal" });
      setSubmitting(false);
      return;
    }

    const payload: TripConsumptionPayload = {
      consumption_item_id: form.item.value,
      time: form.time,
      scope: form.scope,
      price,
      count,
    };

    try {
      await onSubmit(payload, form.participantIds);
    } catch (caughtError) {
      if (caughtError instanceof ApiClientError) {
        setError(caughtError.message);
        setFieldErrors(mapValidationErrors(caughtError.details));
      } else {
        setError(caughtError instanceof Error ? caughtError.message : "Gagal menyimpan consumption expense");
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
          <Button variant="secondary" type="button" onClick={onClose}>
            Batal
          </Button>
          <Button type="button" isLoading={submitting} disabled={submitting} onClick={() => void handleSubmit()}>
            {submitting ? <Spinner /> : null}
            Simpan
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {error ? <Alert tone="danger">{error}</Alert> : null}

        <Autocomplete
          label="Consumption Item"
          value={form.item}
          options={options}
          onChange={handleConsumptionItemChange}
          onCreateOption={onCreateMasterItem}
          createText={(keyword) => `Buat item baru: ${keyword}`}
          error={fieldErrors.consumption_item_id}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Category (Master)"
            value={selectedConsumptionItem?.category ?? "-"}
            disabled
            readOnly
          />
          <Input
            label="Unit (Master)"
            value={selectedConsumptionItem?.unit ?? "-"}
            disabled
            readOnly
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Time"
            value={form.time}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                time: event.target.value as ConsumptionFormValues["time"],
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
                scope: event.target.value as ConsumptionFormValues["scope"],
              }))
            }
            options={[
              { value: "group", label: "group" },
              { value: "personal", label: "personal" },
            ]}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Price"
            type="number"
            min={0}
            value={form.price}
            onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
            error={fieldErrors.price}
            hint={
              selectedConsumptionItem
                ? "Terisi otomatis dari master item, masih bisa diubah."
                : undefined
            }
          />
          <Input
            label="Count"
            type="number"
            min={1}
            value={form.count}
            onChange={(event) => setForm((prev) => ({ ...prev, count: event.target.value }))}
            error={fieldErrors.count}
          />
        </div>

        <ParticipantPicker
          label="Participants"
          options={memberOptions}
          value={form.participantIds}
          onChange={(participantIds) => setForm((prev) => ({ ...prev, participantIds }))}
          error={fieldErrors.participants}
          hint={
            form.scope === "group"
              ? "Kosongkan jika semua anggota ikut."
              : "Wajib pilih minimal satu participant untuk scope personal."
          }
        />
      </div>
    </Modal>
  );
}

function TripAccommodationModal({
  open,
  onClose,
  options,
  memberOptions,
  initialData,
  initialParticipantIds,
  onCreateMasterItem,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  options: AutocompleteOption[];
  memberOptions: ParticipantOption[];
  initialData: TripAccommodationRow | null;
  initialParticipantIds: string[];
  onCreateMasterItem: (keyword: string) => Promise<AutocompleteOption>;
  onSubmit: (payload: Partial<TripAccommodationPayload>, participantIds: string[]) => Promise<void>;
}) {
  const [form, setForm] = useState<AccommodationFormValues>(defaultAccommodationForm);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(defaultAccommodationForm());
      setError("");
      setFieldErrors({});
      return;
    }

    if (!initialData) {
      setForm(defaultAccommodationForm());
      setError("");
      setFieldErrors({});
      return;
    }

    const selectedOption = options.find((option) => option.value === initialData.accommodationItemId) ?? null;

    setForm({
      item: selectedOption,
      scope: initialData.scope,
      price: String(initialData.price),
      count: String(initialData.count),
      participantIds: initialParticipantIds,
    });
    setError("");
    setFieldErrors({});
  }, [open, initialData, initialParticipantIds, options]);

  const selectedAccommodationItem = getOptionMeta<AccommodationItem>(form.item);

  const handleAccommodationItemChange = (item: AutocompleteOption | null) => {
    setForm((prev) => {
      if (!item) {
        return { ...prev, item: null, price: "" };
      }

      if (prev.item?.value === item.value) {
        return { ...prev, item };
      }

      const nextMasterItem = getOptionMeta<AccommodationItem>(item);
      return {
        ...prev,
        item,
        price:
          nextMasterItem?.defaultPrice !== null && nextMasterItem?.defaultPrice !== undefined
            ? String(nextMasterItem.defaultPrice)
            : "",
      };
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    setFieldErrors({});

    const price = parseNumber(form.price);
    const count = parseNumber(form.count);

    if (!form.item) {
      setFieldErrors({ accommodation_item_id: "Pilih item terlebih dahulu" });
      setSubmitting(false);
      return;
    }

    if (price === null || price < 0) {
      setFieldErrors({ price: "Price tidak valid" });
      setSubmitting(false);
      return;
    }

    if (!count || count < 1) {
      setFieldErrors({ count: "Count minimal 1" });
      setSubmitting(false);
      return;
    }

    if (form.scope === "personal" && form.participantIds.length === 0) {
      setFieldErrors({ participants: "Participants wajib untuk scope personal" });
      setSubmitting(false);
      return;
    }

    const payload: TripAccommodationPayload = {
      accommodation_item_id: form.item.value,
      scope: form.scope,
      price,
      count,
    };

    try {
      await onSubmit(payload, form.participantIds);
    } catch (caughtError) {
      if (caughtError instanceof ApiClientError) {
        setError(caughtError.message);
        setFieldErrors(mapValidationErrors(caughtError.details));
      } else {
        setError(caughtError instanceof Error ? caughtError.message : "Gagal menyimpan accommodation expense");
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
          <Button variant="secondary" type="button" onClick={onClose}>
            Batal
          </Button>
          <Button type="button" isLoading={submitting} disabled={submitting} onClick={() => void handleSubmit()}>
            {submitting ? <Spinner /> : null}
            Simpan
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {error ? <Alert tone="danger">{error}</Alert> : null}

        <Autocomplete
          label="Accommodation Item"
          value={form.item}
          options={options}
          onChange={handleAccommodationItemChange}
          onCreateOption={onCreateMasterItem}
          createText={(keyword) => `Buat item baru: ${keyword}`}
          error={fieldErrors.accommodation_item_id}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Category (Master)"
            value={selectedAccommodationItem?.category ?? "-"}
            disabled
            readOnly
          />
          <Input
            label="Unit (Master)"
            value={selectedAccommodationItem?.unit ?? "-"}
            disabled
            readOnly
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Scope"
            value={form.scope}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                scope: event.target.value as AccommodationFormValues["scope"],
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
            onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
            error={fieldErrors.price}
            hint={
              selectedAccommodationItem
                ? "Terisi otomatis dari master item, masih bisa diubah."
                : undefined
            }
          />
        </div>

        <Input
          label="Count"
          type="number"
          min={1}
          value={form.count}
          onChange={(event) => setForm((prev) => ({ ...prev, count: event.target.value }))}
          error={fieldErrors.count}
        />

        <ParticipantPicker
          label="Participants"
          options={memberOptions}
          value={form.participantIds}
          onChange={(participantIds) => setForm((prev) => ({ ...prev, participantIds }))}
          error={fieldErrors.participants}
          hint={
            form.scope === "group"
              ? "Kosongkan jika semua anggota ikut."
              : "Wajib pilih minimal satu participant untuk scope personal."
          }
        />
      </div>
    </Modal>
  );
}

function FundTable({
  title,
  rows,
  memberMap,
  canEdit,
  onEdit,
  onDelete,
}: {
  title: string;
  rows: FundRow[];
  memberMap: Map<string, string>;
  canEdit: boolean;
  onEdit: (row: FundRow) => void;
  onDelete: (row: FundRow) => void;
}) {
  return (
    <div className="space-y-2">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <DataTable
        data={rows}
        rowKey={(row) => row.id}
        searchPlaceholder={`Cari dana ${title.toLowerCase()}...`}
        emptyTitle={`Belum ada dana ${title.toLowerCase()}`}
        columns={[
          {
            id: "source",
            header: title === "Kolektif" ? "Member" : "Source",
            accessor: (row) =>
              row.type === "kolektif"
                ? memberMap.get(row.memberId ?? "") ?? "-"
                : row.sourceName ?? "-",
            cell: (row) =>
              row.type === "kolektif"
                ? memberMap.get(row.memberId ?? "") ?? "-"
                : row.sourceName ?? "-",
          },
          {
            id: "amount",
            header: "Amount",
            accessor: (row) => row.amount,
            numeric: true,
            cell: (row) => formatCurrencyIDR(row.amount),
          },
          { id: "method", header: "Method", accessor: (row) => row.method ?? "-" },
          {
            id: "paid-at",
            header: "Paid At",
            accessor: (row) => row.paidAt ?? "",
            cell: (row) => formatDate(row.paidAt),
          },
          { id: "note", header: "Note", accessor: (row) => row.note ?? "-" },
          {
            id: "actions",
            header: "Actions",
            searchable: false,
            align: "right",
            className: "w-28",
            cell: (row) =>
              canEdit ? (
                <div className="flex justify-end gap-2">
                  <IconButton onClick={() => onEdit(row)}>
                    <PencilSquareIcon className="h-4 w-4" />
                  </IconButton>
                  <IconButton tone="danger" onClick={() => onDelete(row)}>
                    <TrashIcon className="h-4 w-4" />
                  </IconButton>
                </div>
              ) : (
                <span className="text-xs text-slate-500">Read only</span>
              ),
          },
        ]}
      />
    </div>
  );
}

function FundModal({
  open,
  onClose,
  memberOptions,
  initialData,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  memberOptions: ParticipantOption[];
  initialData: FundRow | null;
  onSubmit: (payload: Partial<FundPayload>) => Promise<void>;
}) {
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

    if (!initialData) {
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

  const isKolektif = form.type === "kolektif";

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    setFieldErrors({});

    if (form.amount < 0) {
      setFieldErrors({ amount: "Amount tidak boleh negatif" });
      setSubmitting(false);
      return;
    }

    if (isKolektif && !form.member_id) {
      setFieldErrors({ member_id: "Member wajib diisi untuk kolektif" });
      setSubmitting(false);
      return;
    }

    if (!isKolektif && !form.source_name) {
      setFieldErrors({ source_name: "Source name wajib diisi untuk donatur" });
      setSubmitting(false);
      return;
    }

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
          <Button type="button" isLoading={submitting} disabled={submitting} onClick={() => void handleSubmit()}>
            {submitting ? <Spinner /> : null}
            Simpan
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
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
            options={memberOptions}
            placeholder="Pilih member"
            error={fieldErrors.member_id}
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
          />
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Amount"
            type="number"
            min={0}
            value={String(form.amount)}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                amount: Number(event.target.value || "0"),
              }))
            }
            error={fieldErrors.amount}
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
      </div>
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
