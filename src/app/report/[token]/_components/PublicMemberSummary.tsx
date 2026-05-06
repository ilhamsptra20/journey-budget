import { Badge, Card, CardContent, CardHeader } from "@/ui/components";
import { formatCurrencyIDR } from "@/ui/utils/format";

type PublicMemberSummaryProps = {
  members: Array<{
    name: string;
    tagihan: number;
    bayar: number;
    sisa: number;
    status: "unpaid" | "partial" | "paid";
  }>;
};

function statusTone(status: "unpaid" | "partial" | "paid") {
  if (status === "paid") {
    return "success";
  }

  if (status === "partial") {
    return "warning";
  }

  return "danger";
}

export function PublicMemberSummary({ members }: PublicMemberSummaryProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Ringkasan Anggota</h2>

      <div className="space-y-2 md:hidden">
        {members.length === 0 ? (
          <Card>
            <CardContent>
              <p className="text-sm text-slate-500">Belum ada data anggota.</p>
            </CardContent>
          </Card>
        ) : (
          members.map((member) => (
            <Card key={member.name}>
              <CardContent>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">{member.name}</p>
                  <Badge tone={statusTone(member.status)}>{member.status}</Badge>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-slate-500">Tagihan</p>
                    <p className="mt-1 font-medium text-slate-800">{formatCurrencyIDR(member.tagihan)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Bayar</p>
                    <p className="mt-1 font-medium text-slate-800">{formatCurrencyIDR(member.bayar)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Sisa</p>
                    <p className="mt-1 font-medium text-slate-800">{formatCurrencyIDR(member.sisa)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card className="hidden md:block">
        <CardHeader>
          <h3 className="text-sm font-semibold text-slate-900">Detail Pembayaran Anggota</h3>
        </CardHeader>
        <CardContent className="px-0 py-0">
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Nama</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">Tagihan</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">Bayar</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">Sisa</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-sm text-slate-500" colSpan={5}>
                      Belum ada data anggota.
                    </td>
                  </tr>
                ) : (
                  members.map((member) => (
                    <tr key={member.name} className="border-t border-slate-100 hover:bg-slate-50/60">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{member.name}</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-700">{formatCurrencyIDR(member.tagihan)}</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-700">{formatCurrencyIDR(member.bayar)}</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-700">{formatCurrencyIDR(member.sisa)}</td>
                      <td className="px-4 py-3 text-right">
                        <Badge tone={statusTone(member.status)}>{member.status}</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
