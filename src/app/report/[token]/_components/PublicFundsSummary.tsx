import { BanknotesIcon } from "@heroicons/react/24/outline";

import { Card, CardContent } from "@/ui/components";
import { formatCurrencyIDR } from "@/ui/utils/format";

type PublicFundsSummaryProps = {
  funds: {
    kolektif: number;
    donatur: number;
    total: number;
  };
};

export function PublicFundsSummary({ funds }: PublicFundsSummaryProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Dana Masuk</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Card>
          <CardContent>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Kolektif</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{formatCurrencyIDR(funds.kolektif)}</p>
              </div>
              <BanknotesIcon className="h-5 w-5 text-slate-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Donatur</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{formatCurrencyIDR(funds.donatur)}</p>
              </div>
              <BanknotesIcon className="h-5 w-5 text-slate-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
