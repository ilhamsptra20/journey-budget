"use client";

import { ChartBarIcon, MapPinIcon, UsersIcon } from "@heroicons/react/24/outline";

import {
  Alert,
  Card,
  CardContent,
  DataTable,
  PageHeader,
  StatCard,
} from "@/ui/components";
import { formatDate } from "@/ui/utils/format";

import { useDashboardData } from "../_hooks/useDashboardData";

export function DashboardOverview() {
  const { loading, error, stats } = useDashboardData();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Dashboard"
        description="Snapshot ringkas operasional Trip Budgeting"
      />

      {error ? <Alert tone="danger">{error}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Trips" value={String(stats.totalTrips)} icon={<MapPinIcon className="h-5 w-5" />} />
        <StatCard label="Active Trips" value={String(stats.activeTrips)} icon={<ChartBarIcon className="h-5 w-5" />} />
        <StatCard label="Total Members" value={String(stats.totalMembers)} icon={<UsersIcon className="h-5 w-5" />} />
        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">Summary</p>
            <p className="mt-1 text-sm text-slate-800">
              Pantau trip aktif dan membership dengan tampilan terpusat.
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-base font-semibold text-slate-900">Recent Trips</h2>
        <DataTable
          data={stats.recentTrips}
          loading={loading}
          searchEnabled={false}
          rowKey={(trip) => trip.id}
          emptyTitle="Belum ada trip"
          emptyDescription="Buat trip baru untuk mulai budgeting."
          columns={[
            {
              id: "title",
              header: "Title",
              accessor: (trip) => trip.title,
              cell: (trip) => <span className="font-medium text-slate-900">{trip.title}</span>,
            },
            {
              id: "location",
              header: "Location",
              accessor: (trip) => trip.location,
            },
            {
              id: "start",
              header: "Start Date",
              accessor: (trip) => trip.startDate,
              cell: (trip) => formatDate(trip.startDate),
            },
            {
              id: "end",
              header: "End Date",
              accessor: (trip) => trip.endDate ?? "",
              cell: (trip) => formatDate(trip.endDate),
            },
          ]}
        />
      </div>
    </div>
  );
}
