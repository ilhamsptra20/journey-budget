import { CubeIcon } from "@heroicons/react/24/outline";

import { Card, CardContent, CardHeader } from "@/ui/components";
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
    item: string;
    meta: string;
    amount: number;
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
            {rows.map((row, index) => (
              <div key={`${row.item}-${index}`} className="rounded-md border border-slate-100 bg-slate-50 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{row.item}</p>
                    <p className="mt-1 text-xs text-slate-500">{row.meta}</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{formatCurrencyIDR(row.amount)}</p>
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
          rows={logistics.map((row) => ({
            item: row.item,
            meta: `${row.acquisition_type} • ${row.scope} • ${row.count} ${row.unit}`,
            amount: row.amount,
          }))}
        />
        <ExpenseList
          title="Konsumsi"
          rows={consumptions.map((row) => ({
            item: row.item,
            meta: `${row.category} • ${row.time} • ${row.count} ${row.unit}`,
            amount: row.amount,
          }))}
        />
        <ExpenseList
          title="Akomodasi"
          rows={accommodations.map((row) => ({
            item: row.item,
            meta: `${row.category} • ${row.scope} • ${row.count} ${row.unit}`,
            amount: row.amount,
          }))}
        />
      </div>
    </section>
  );
}
