"use client";

import { ChartBarIcon, MapPinIcon, UsersIcon } from "@heroicons/react/24/outline";

import {
  Alert,
  Card,
  CardContent,
  EmptyState,
  PageHeader,
  Spinner,
  StatCard,
  Table,
  TableContainer,
  TBody,
  TD,
  TH,
  THead,
  TR,
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
        {loading ? (
          <div className="flex h-24 items-center justify-center">
            <Spinner className="h-5 w-5" />
          </div>
        ) : stats.recentTrips.length === 0 ? (
          <EmptyState title="Belum ada trip" description="Buat trip baru untuk mulai budgeting." />
        ) : (
          <TableContainer>
            <Table>
              <THead>
                <tr>
                  <TH>Title</TH>
                  <TH>Location</TH>
                  <TH>Start Date</TH>
                  <TH>End Date</TH>
                </tr>
              </THead>
              <TBody>
                {stats.recentTrips.map((trip) => (
                  <TR key={trip.id}>
                    <TD className="font-medium text-slate-900">{trip.title}</TD>
                    <TD>{trip.location}</TD>
                    <TD>{formatDate(trip.startDate)}</TD>
                    <TD>{formatDate(trip.endDate)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </TableContainer>
        )}
      </div>
    </div>
  );
}
