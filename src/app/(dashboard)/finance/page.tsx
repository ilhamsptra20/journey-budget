import Link from "next/link";

import { Card, CardContent, PageHeader } from "@/ui/components";

export default function FinancePage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Funds / Finance"
        description="Akses detail pendanaan per trip dari halaman Trip Detail"
      />
      <Card>
        <CardContent>
          <p className="text-sm text-slate-600">
            Modul dana dioperasikan di halaman detail trip. Buka daftar trips di{" "}
            <Link className="font-medium text-emerald-700 hover:text-emerald-800" href="/trips">
              halaman Trips
            </Link>{" "}
            lalu pilih salah satu trip untuk mengelola dana kolektif dan donatur.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
