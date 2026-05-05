import { ReactNode } from "react";

import { Card, CardContent } from "@/ui/components/Card";

type StatCardProps = {
  label: string;
  value: string;
  icon?: ReactNode;
  hint?: string;
};

export function StatCard({ label, value, icon, hint }: StatCardProps) {
  return (
    <Card>
      <CardContent>
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
            {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
          </div>
          {icon ? <div className="text-slate-400">{icon}</div> : null}
        </div>
      </CardContent>
    </Card>
  );
}
