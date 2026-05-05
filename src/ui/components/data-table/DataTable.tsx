"use client";

import { ReactNode, useMemo, useState } from "react";

import { Button } from "@/ui/components/Button";
import { EmptyState } from "@/ui/components/EmptyState";
import { Input } from "@/ui/components/Input";
import { Spinner } from "@/ui/components/Spinner";
import { cn } from "@/ui/utils/cn";

export type DataTableColumn<T> = {
  id: string;
  header: string;
  accessor?: (row: T) => unknown;
  cell?: (row: T) => ReactNode;
  searchable?: boolean;
  align?: "left" | "right" | "center";
  numeric?: boolean;
  className?: string;
  headerClassName?: string;
};

type DataTableProps<T> = {
  data: T[];
  columns: DataTableColumn<T>[];
  rowKey: (row: T, index: number) => string;
  loading?: boolean;
  loadingRows?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  searchPlaceholder?: string;
  searchEnabled?: boolean;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  stickyHeader?: boolean;
  minTableWidthClassName?: string;
  className?: string;
};

const DEFAULT_PAGE_SIZES = [5, 10, 20];

export function DataTable<T>({
  data,
  columns,
  rowKey,
  loading = false,
  loadingRows = 6,
  emptyTitle = "Data kosong",
  emptyDescription = "Belum ada data untuk ditampilkan.",
  searchPlaceholder = "Cari data...",
  searchEnabled = true,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  defaultPageSize = 10,
  stickyHeader = true,
  minTableWidthClassName = "min-w-[760px]",
  className,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [page, setPage] = useState(1);

  const filteredData = useMemo(() => {
    if (!searchEnabled || !searchTerm.trim()) {
      return data;
    }

    const term = searchTerm.trim().toLowerCase();

    return data.filter((row) => {
      return columns.some((column) => {
        if (column.searchable === false) {
          return false;
        }

        const value = column.accessor ? column.accessor(row) : null;
        if (value === null || value === undefined) {
          return false;
        }

        return String(value).toLowerCase().includes(term);
      });
    });
  }, [columns, data, searchEnabled, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const pagedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const headerClasses = (column: DataTableColumn<T>) => {
    const alignClass =
      column.align === "right" || column.numeric
        ? "text-right"
        : column.align === "center"
          ? "text-center"
          : "text-left";

    return cn(
      "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600",
      alignClass,
      column.headerClassName,
    );
  };

  const cellClasses = (column: DataTableColumn<T>) => {
    const alignClass =
      column.align === "right" || column.numeric
        ? "text-right"
        : column.align === "center"
          ? "text-center"
          : "text-left";

    return cn("px-4 py-3 text-sm text-slate-700", alignClass, column.className);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {searchEnabled ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="w-full max-w-sm">
            <Input
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPage(1);
              }}
              placeholder={searchPlaceholder}
              aria-label="Search table"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Rows per page</span>
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className={cn("w-full border-separate border-spacing-0", minTableWidthClassName)}>
            <thead className="bg-slate-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.id}
                    className={cn(
                      headerClasses(column),
                      stickyHeader && "sticky top-0 z-10 bg-slate-50",
                    )}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: loadingRows }).map((_, index) => (
                    <tr key={`skeleton-${index}`} className="border-t border-slate-100">
                      {columns.map((column) => (
                        <td key={`${column.id}-${index}`} className={cellClasses(column)}>
                          <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                        </td>
                      ))}
                    </tr>
                  ))
                : pagedData.map((row, index) => (
                    <tr key={rowKey(row, index)} className="border-t border-slate-100 hover:bg-slate-50/60">
                      {columns.map((column) => {
                        const rawValue = column.accessor ? column.accessor(row) : null;

                        return (
                          <td key={column.id} className={cellClasses(column)}>
                            {column.cell ? column.cell(row) : rawValue !== null && rawValue !== undefined ? String(rawValue) : "-"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {!loading && pagedData.length === 0 ? (
          <div className="p-6">
            <EmptyState title={emptyTitle} description={emptyDescription} />
          </div>
        ) : null}
      </div>

      {!loading && filteredData.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="text-slate-500">
            Menampilkan {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredData.length)} dari {filteredData.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Prev
            </Button>
            <span className="text-xs text-slate-500">
              Page {currentPage} / {totalPages}
            </span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
          <Spinner />
          Loading data...
        </div>
      ) : null}
    </div>
  );
}
