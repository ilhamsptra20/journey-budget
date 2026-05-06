import { CubeIcon } from "@heroicons/react/24/outline";

import { Badge, Card, CardContent, CardHeader } from "@/ui/components";
import {
  calculateAccommodationSubtotal,
  calculateConsumptionSubtotal,
  calculateLogisticSubtotal,
} from "@/ui/utils/calculate";
import { formatCurrencyIDR } from "@/ui/utils/format";

type LogisticBreakdown = {
  item: string;
  unit: string;
  acquisition_type: string;
  scope: string;
  cost_type: string;
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
  price: number;
  count: number;
  amount: number;
};

type AccommodationBreakdown = {
  item: string;
  category: string;
  unit: string;
  scope: string;
  price: number;
  count: number;
  amount: number;
};

type PublicExpenseBreakdownProps = {
  logistics: LogisticBreakdown[];
  consumptions: ConsumptionBreakdown[];
  accommodations: AccommodationBreakdown[];
};

function ExpenseList({
  title,
  rows,
}: {
  title: string;
  rows: Array<{
    key: string;
    item: string;
    subtitle: string;
    priceLabel: string;
    countLabel: string;
    durationLabel?: string;
    subtotal: number;
    isFree?: boolean;
  }>;
}) {
  return (
    <Card>
      <CardHeader className="flex items-center gap-2">
        <CubeIcon className="h-4 w-4 text-slate-500" />
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada data.</p>
        ) : (
          <div className="space-y-2">
            {rows.map((row) => (
              <div key={row.key} className="rounded-md border border-slate-100 bg-slate-50 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-slate-900">{row.item}</p>
                      {row.isFree ? <Badge tone="default">Free</Badge> : null}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{row.subtitle}</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <p>Harga</p>
                  <p className="text-right">{row.priceLabel}</p>
                  <p>Jumlah</p>
                  <p className="text-right">{row.countLabel}</p>
                  {row.durationLabel ? (
                    <>
                      <p>Durasi</p>
                      <p className="text-right">{row.durationLabel}</p>
                    </>
                  ) : null}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Subtotal</p>
                  <p className="text-sm font-semibold text-slate-900">{formatCurrencyIDR(row.subtotal)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function PublicExpenseBreakdown({
  logistics,
  consumptions,
  accommodations,
}: PublicExpenseBreakdownProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Breakdown Biaya</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        <ExpenseList
          title="Logistik"
          rows={logistics.map((row, index) => {
            const computed = calculateLogisticSubtotal({
              costType: row.cost_type,
              acquisitionType: row.acquisition_type,
              price: row.price,
              count: row.count,
              duration: row.duration,
            });
            const subtotal = Number.isFinite(row.amount) ? row.amount : computed;

            return {
              key: `log-${index}-${row.item}`,
              item: row.item,
              subtitle: `${row.acquisition_type} • ${row.scope} • ${row.unit}`,
              priceLabel: row.price !== null ? formatCurrencyIDR(row.price) : "-",
              countLabel: String(row.count),
              durationLabel: row.acquisition_type === "sewa" ? String(row.duration ?? 0) : undefined,
              subtotal,
              isFree: row.cost_type === "free",
            };
          })}
        />
        <ExpenseList
          title="Konsumsi"
          rows={consumptions.map((row, index) => {
            const computed = calculateConsumptionSubtotal({ price: row.price, count: row.count });
            const subtotal = Number.isFinite(row.amount) ? row.amount : computed;

            return {
              key: `con-${index}-${row.item}`,
              item: row.item,
              subtitle: `${row.category} • ${row.time} • ${row.scope} • ${row.unit}`,
              priceLabel: formatCurrencyIDR(row.price),
              countLabel: String(row.count),
              subtotal,
            };
          })}
        />
        <ExpenseList
          title="Akomodasi"
          rows={accommodations.map((row, index) => {
            const computed = calculateAccommodationSubtotal({ price: row.price, count: row.count });
            const subtotal = Number.isFinite(row.amount) ? row.amount : computed;

            return {
              key: `acc-${index}-${row.item}`,
              item: row.item,
              subtitle: `${row.category} • ${row.scope} • ${row.unit}`,
              priceLabel: formatCurrencyIDR(row.price),
              countLabel: String(row.count),
              subtotal,
            };
          })}
        />
      </div>
    </section>
  );
}
