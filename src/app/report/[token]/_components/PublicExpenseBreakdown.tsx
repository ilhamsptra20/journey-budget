"use client";

import { useEffect, useState } from "react";
import { CubeIcon } from "@heroicons/react/24/outline";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
} from "@/ui/components";
import {
  calculateAccommodationsTotal,
  calculateAccommodationSubtotal,
  calculateConsumptionsTotal,
  calculateConsumptionSubtotal,
  calculateExpenseParticipantsCount,
  calculateLogisticsTotal,
  calculateLogisticSubtotal,
  calculateParticipantShare,
} from "@/ui/utils/calculate";
import { formatCurrencyIDR } from "@/ui/utils/format";

type LogisticBreakdown = {
  item: string;
  unit: string;
  acquisition_type: string;
  scope: string;
  cost_type: string;
  participants_count?: number;
  price: number | null;
  count: number;
  duration: number | null;
  amount: number;
};

type ConsumptionBreakdown = {
  item: string;
  category: string;
  unit: string;
  time: string;
  scope: string;
  participants_count?: number;
  price: number;
  count: number;
  amount: number;
};

type AccommodationBreakdown = {
  item: string;
  category: string;
  unit: string;
  scope: string;
  participants_count?: number;
  price: number;
  count: number;
  amount: number;
};

type PublicExpenseBreakdownProps = {
  membersCount: number;
  logistics: LogisticBreakdown[];
  consumptions: ConsumptionBreakdown[];
  accommodations: AccommodationBreakdown[];
};

type ExpenseBreakdownRow = {
  key: string;
  title: string;
  summary: string;
  badges: string[];
  priceLabel: string;
  countLabel: string;
  durationLabel?: string;
  participantsLabel: string;
  shareLabel?: string;
  subtotal: number;
  isFree?: boolean;
};

function ExpenseItemCards({ rows }: { rows: ExpenseBreakdownRow[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-slate-500">Belum ada item.</p>;
  }

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div key={row.key} className="rounded-md border border-slate-100 bg-slate-50 p-3">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{row.title}</p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                {row.badges.map((badge) => (
                  <Badge key={`${row.key}-${badge}`} className="px-2 py-0.5 text-[11px]">
                    {badge}
                  </Badge>
                ))}
                {row.isFree ? <Badge className="px-2 py-0.5 text-[11px]">Gratis</Badge> : null}
              </div>
              <p className="mt-1 text-xs text-slate-500">{row.summary}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Subtotal</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{formatCurrencyIDR(row.subtotal)}</p>
            </div>
          </div>
          <div className="mt-3 border-t border-slate-200 pt-2">
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              <p className="text-xs text-slate-500">Harga</p>
              <p className="text-right text-sm text-slate-700">{row.priceLabel}</p>
              <p className="text-xs text-slate-500">Jumlah</p>
              <p className="text-right text-sm text-slate-700">{row.countLabel}</p>
              {row.durationLabel ? (
                <>
                  <p className="text-xs text-slate-500">Durasi</p>
                  <p className="text-right text-sm text-slate-700">{row.durationLabel}</p>
                </>
              ) : null}
              <p className="text-xs text-slate-500">Peserta</p>
              <p className="text-right text-sm text-slate-700">{row.participantsLabel}</p>
              {row.shareLabel ? (
                <>
                  <p className="text-xs text-slate-500">Per Orang</p>
                  <p className="text-right text-sm text-slate-700">{row.shareLabel}</p>
                </>
              ) : null}
              <p className="text-xs text-slate-500">Subtotal</p>
              <p className="text-right text-sm font-semibold text-slate-900">
                {formatCurrencyIDR(row.subtotal)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ExpenseSectionAccordion({
  sectionId,
  title,
  sectionTotal,
  rows,
}: {
  sectionId: string;
  title: string;
  sectionTotal: number;
  rows: ExpenseBreakdownRow[];
}) {
  return (
    <AccordionItem value={sectionId} className="rounded-lg border border-slate-200 bg-white">
      <AccordionTrigger className="px-0 py-0 hover:bg-white">
        <div className="flex min-w-0 items-center justify-between gap-2 px-5 py-4">
          <div className="flex items-center gap-2">
            <CubeIcon className="h-4 w-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-right">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Total</p>
            <p className="text-xs font-semibold text-slate-900">{formatCurrencyIDR(sectionTotal)}</p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="border-t border-slate-100 px-5 py-4">
          <ExpenseItemCards rows={rows} />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export function PublicExpenseBreakdown({
  membersCount,
  logistics,
  consumptions,
  accommodations,
}: PublicExpenseBreakdownProps) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const applyDesktopState = () => {
      setIsDesktop(mediaQuery.matches);
    };

    applyDesktopState();
    mediaQuery.addEventListener("change", applyDesktopState);

    return () => {
      mediaQuery.removeEventListener("change", applyDesktopState);
    };
  }, []);

  const logisticRows = logistics.map((row, index) => {
    const participantsCount = calculateExpenseParticipantsCount({
      scope: row.scope,
      participantsCount: row.participants_count,
      tripMembersCount: membersCount,
    });
    const subtotal = calculateLogisticSubtotal({
      costType: row.cost_type,
      acquisitionType: row.acquisition_type,
      scope: row.scope,
      price: row.price,
      count: row.count,
      duration: row.duration,
      participantsCount,
    });
    const isFree = row.cost_type === "free";
    const isAllMembers = row.scope === "group" && participantsCount === membersCount;
    const participantsLabel =
      participantsCount > 0 ? (isAllMembers ? "Semua anggota" : `${participantsCount} peserta`) : "-";
    const shareLabel =
      !isFree && participantsCount > 0
        ? `${formatCurrencyIDR(calculateParticipantShare(subtotal, participantsCount))}/orang`
        : undefined;

    return {
      key: `log-${index}-${row.item}`,
      title: row.item,
      summary: `${row.scope} • ${participantsLabel}`,
      badges: [row.acquisition_type, row.scope, row.unit],
      priceLabel: row.price !== null ? formatCurrencyIDR(row.price) : "-",
      countLabel: String(row.count),
      durationLabel: row.acquisition_type === "sewa" ? `${row.duration ?? 0} hari` : undefined,
      participantsLabel,
      shareLabel,
      subtotal,
      isFree,
    };
  });

  const consumptionRows = consumptions.map((row, index) => {
    const participantsCount = calculateExpenseParticipantsCount({
      scope: row.scope,
      participantsCount: row.participants_count,
      tripMembersCount: membersCount,
    });
    const subtotal = calculateConsumptionSubtotal({
      scope: row.scope,
      price: row.price,
      count: row.count,
      participantsCount,
    });
    const isAllMembers = row.scope === "group" && participantsCount === membersCount;
    const participantsLabel =
      participantsCount > 0 ? (isAllMembers ? "Semua anggota" : `${participantsCount} peserta`) : "-";
    const shareLabel =
      participantsCount > 0
        ? `${formatCurrencyIDR(calculateParticipantShare(subtotal, participantsCount))}/orang`
        : undefined;

    return {
      key: `con-${index}-${row.item}`,
      title: row.item,
      summary: `${row.scope} • ${participantsLabel}`,
      badges: [row.category, row.time, row.unit],
      priceLabel: formatCurrencyIDR(row.price),
      countLabel: String(row.count),
      participantsLabel,
      shareLabel,
      subtotal,
    };
  });

  const accommodationRows = accommodations.map((row, index) => {
    const participantsCount = calculateExpenseParticipantsCount({
      scope: row.scope,
      participantsCount: row.participants_count,
      tripMembersCount: membersCount,
    });
    const subtotal = calculateAccommodationSubtotal({
      scope: row.scope,
      price: row.price,
      count: row.count,
      participantsCount,
    });
    const isAllMembers = row.scope === "group" && participantsCount === membersCount;
    const participantsLabel =
      participantsCount > 0 ? (isAllMembers ? "Semua anggota" : `${participantsCount} peserta`) : "-";
    const shareLabel =
      participantsCount > 0
        ? `${formatCurrencyIDR(calculateParticipantShare(subtotal, participantsCount))}/orang`
        : undefined;

    return {
      key: `acc-${index}-${row.item}`,
      title: row.item,
      summary: `${row.scope} • ${participantsLabel}`,
      badges: [row.category, row.unit],
      priceLabel: formatCurrencyIDR(row.price),
      countLabel: String(row.count),
      participantsLabel,
      shareLabel,
      subtotal,
    };
  });

  const logisticsTotal = calculateLogisticsTotal(
    logistics.map((row) => ({
      costType: row.cost_type,
      acquisitionType: row.acquisition_type,
      scope: row.scope,
      price: row.price,
      count: row.count,
      duration: row.duration,
      participantsCount: calculateExpenseParticipantsCount({
        scope: row.scope,
        participantsCount: row.participants_count,
        tripMembersCount: membersCount,
      }),
    })),
  );
  const consumptionsTotal = calculateConsumptionsTotal(
    consumptions.map((row) => ({
      scope: row.scope,
      price: row.price,
      count: row.count,
      participantsCount: calculateExpenseParticipantsCount({
        scope: row.scope,
        participantsCount: row.participants_count,
        tripMembersCount: membersCount,
      }),
    })),
  );
  const accommodationsTotal = calculateAccommodationsTotal(
    accommodations.map((row) => ({
      scope: row.scope,
      price: row.price,
      count: row.count,
      participantsCount: calculateExpenseParticipantsCount({
        scope: row.scope,
        participantsCount: row.participants_count,
        tripMembersCount: membersCount,
      }),
    })),
  );

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Breakdown Biaya</h2>
      <Accordion
        key={isDesktop ? "desktop-sections" : "mobile-sections"}
        multiple
        defaultOpen={isDesktop}
        className="space-y-0 grid grid-cols-1 gap-3 lg:grid-cols-3"
      >
        <ExpenseSectionAccordion
          sectionId="logistics-section"
          title="Logistik"
          sectionTotal={logisticsTotal}
          rows={logisticRows}
        />
        <ExpenseSectionAccordion
          sectionId="consumptions-section"
          title="Konsumsi"
          sectionTotal={consumptionsTotal}
          rows={consumptionRows}
        />
        <ExpenseSectionAccordion
          sectionId="accommodations-section"
          title="Akomodasi"
          sectionTotal={accommodationsTotal}
          rows={accommodationRows}
        />
      </Accordion>
    </section>
  );
}
