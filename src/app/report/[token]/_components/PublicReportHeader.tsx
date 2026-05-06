import { CalendarDaysIcon, MapPinIcon } from "@heroicons/react/24/outline";

import { Badge } from "@/ui/components";
import { formatDate } from "@/ui/utils/format";

type PublicReportHeaderProps = {
  trip: {
    title: string;
    location: string;
    start_date: string;
    end_date: string | null;
  };
};

export function PublicReportHeader({ trip }: PublicReportHeaderProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Trip Report</p>
          <h1 className="mt-1 text-2xl font-semibold leading-tight text-slate-900">{trip.title}</h1>
        </div>
        <Badge className="bg-emerald-100 text-emerald-700">Public Report</Badge>
      </div>

      <div className="mt-4 grid gap-2 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <MapPinIcon className="h-4 w-4 text-slate-400" />
          <span>{trip.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDaysIcon className="h-4 w-4 text-slate-400" />
          <span>
            {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
          </span>
        </div>
      </div>
    </section>
  );
}
