import type { ReactNode } from "react";
import { BanknotesIcon, CalculatorIcon, UsersIcon, WalletIcon } from "@heroicons/react/24/outline";

import { Card, CardContent } from "@/ui/components";
import { formatCurrencyIDR } from "@/ui/utils/format";

type PublicReportStatCardsProps = {
  membersCount: number;
  expenses: {
    total: number;
  };
  funds: {
    kolektif: number;
    donatur: number;
  };
  saldoTrip: number;
};

function StatCard({
  label,
  value,
  icon,
  valueClassName = "text-slate-900",
}: {
  label: string;
  value: string;
  icon: ReactNode;
  valueClassName?: string;
}) {
  return (
    <Card>
      <CardContent>
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
            <p className={`mt-2 text-xl font-semibold ${valueClassName}`}>{value}</p>
          </div>
          <div className="rounded-md border border-slate-200 p-2 text-slate-500">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PublicReportStatCards({
  membersCount,
  expenses,
  funds,
  saldoTrip,
}: PublicReportStatCardsProps) {
  const saldoClassName =
    saldoTrip > 0 ? "text-emerald-700" : saldoTrip < 0 ? "text-red-700" : "text-slate-900";

  return (
    <section className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
      <StatCard
        label="Total Biaya"
        value={formatCurrencyIDR(expenses.total)}
        icon={<CalculatorIcon className="h-5 w-5" />}
      />
      <StatCard
        label="Dana Kolektif"
        value={formatCurrencyIDR(funds.kolektif)}
        icon={<WalletIcon className="h-5 w-5" />}
      />
      <StatCard
        label="Donatur"
        value={formatCurrencyIDR(funds.donatur)}
        icon={<BanknotesIcon className="h-5 w-5" />}
      />
      <StatCard
        label="Saldo Trip"
        value={formatCurrencyIDR(saldoTrip)}
        valueClassName={saldoClassName}
        icon={<WalletIcon className="h-5 w-5" />}
      />
      <StatCard
        label="Jumlah Anggota"
        value={String(membersCount)}
        icon={<UsersIcon className="h-5 w-5" />}
      />
    </section>
  );
}
