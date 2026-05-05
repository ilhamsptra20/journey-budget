"use client";

import Link from "next/link";
import { PencilSquareIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/outline";

import {
  EmptyState,
  IconButton,
  Spinner,
  Table,
  TableContainer,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/ui/components";
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
  if (loading) {
    return (
      <div className="flex h-24 items-center justify-center">
        <Spinner className="h-5 w-5" />
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <EmptyState
        title="Belum ada trip"
        description="Trip yang dibuat akan tampil di sini."
      />
    );
  }

  return (
    <TableContainer>
      <Table>
        <THead>
          <tr>
            <TH>Title</TH>
            <TH>Location</TH>
            <TH>Date</TH>
            <TH className="w-40">Actions</TH>
          </tr>
        </THead>
        <TBody>
          {trips.map((trip) => (
            <TR key={trip.id}>
              <TD className="font-medium text-slate-900">{trip.title}</TD>
              <TD>{trip.location}</TD>
              <TD>
                {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
              </TD>
              <TD>
                <div className="flex items-center gap-2">
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
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </TableContainer>
  );
}
