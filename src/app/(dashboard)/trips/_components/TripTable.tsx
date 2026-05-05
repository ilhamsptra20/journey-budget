"use client";

import Link from "next/link";
import { EyeIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

import { DataTable, IconButton } from "@/ui/components";
import { formatDate } from "@/ui/utils/format";

import type { Trip } from "../_hooks/useTrips";

type TripTableProps = {
  trips: Trip[];
  loading: boolean;
  canEdit: boolean;
  onEdit: (trip: Trip) => void;
  onDelete: (trip: Trip) => void;
};

export function TripTable({ trips, loading, canEdit, onEdit, onDelete }: TripTableProps) {
  return (
    <DataTable
      data={trips}
      loading={loading}
      rowKey={(trip) => trip.id}
      searchPlaceholder="Cari trip..."
      emptyTitle="Belum ada trip"
      emptyDescription="Trip yang dibuat akan tampil di sini."
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
          id: "date",
          header: "Date",
          accessor: (trip) => `${trip.startDate} ${trip.endDate ?? ""}`,
          cell: (trip) => (
            <span>
              {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
            </span>
          ),
        },
        {
          id: "actions",
          header: "Actions",
          searchable: false,
          className: "w-40",
          cell: (trip) => (
            <div className="flex items-center justify-end gap-2">
              <Link href={`/trips/${trip.id}`}>
                <IconButton aria-label="Detail trip">
                  <EyeIcon className="h-4 w-4" />
                </IconButton>
              </Link>
              {canEdit ? (
                <>
                  <IconButton aria-label="Edit trip" onClick={() => onEdit(trip)}>
                    <PencilSquareIcon className="h-4 w-4" />
                  </IconButton>
                  <IconButton tone="danger" aria-label="Hapus trip" onClick={() => onDelete(trip)}>
                    <TrashIcon className="h-4 w-4" />
                  </IconButton>
                </>
              ) : null}
            </div>
          ),
          align: "right",
        },
      ]}
    />
  );
}
