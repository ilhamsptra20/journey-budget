"use client";

import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

import { Card, CardContent, Spinner } from "@/ui/components";

import { usePublicReport } from "../_hooks/usePublicReport";
import { PublicExpenseBreakdown } from "./PublicExpenseBreakdown";
import { PublicFundsSummary } from "./PublicFundsSummary";
import { PublicMemberSummary } from "./PublicMemberSummary";
import { PublicReportFooter } from "./PublicReportFooter";
import { PublicReportHeader } from "./PublicReportHeader";
import { PublicReportStatCards } from "./PublicReportStatCards";

type PublicReportPageContentProps = {
  token: string;
};

export function PublicReportPageContent({ token }: PublicReportPageContentProps) {
  const { report, loading, available } = usePublicReport(token);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <Card>
            <CardContent>
              <div className="flex items-center justify-center gap-3 py-8 text-slate-600">
                <Spinner className="h-5 w-5" />
                <span className="text-sm">Memuat report...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (!available || !report) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardContent>
              <div className="flex flex-col items-center py-8 text-center">
                <ExclamationTriangleIcon className="h-8 w-8 text-amber-500" />
                <h1 className="mt-4 text-xl font-semibold text-slate-900">Report tidak tersedia</h1>
                <p className="mt-2 text-sm text-slate-600">
                  Link mungkin salah, sudah dinonaktifkan, atau belum dibagikan.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:py-8">
      <div className="mx-auto max-w-5xl space-y-4">
        <PublicReportHeader trip={report.trip} />
        <PublicReportStatCards
          membersCount={report.members_count}
          expenses={report.expenses}
          funds={report.funds}
          saldoTrip={report.saldo_trip}
        />
        <PublicExpenseBreakdown
          membersCount={report.members_count}
          logistics={report.breakdown.logistics}
          consumptions={report.breakdown.consumptions}
          accommodations={report.breakdown.accommodations}
        />
        <PublicFundsSummary funds={report.funds} />
        <PublicMemberSummary members={report.members} />
        <PublicReportFooter />
      </div>
    </main>
  );
}
