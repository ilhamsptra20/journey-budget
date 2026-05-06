"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

import { Badge } from "@/ui/components/Badge";
import { Spinner } from "@/ui/components/Spinner";
import { cn } from "@/ui/utils/cn";

export type ParticipantOption = {
  value: string;
  label: string;
};

type ParticipantPickerProps = {
  label?: string;
  options: ParticipantOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  error?: string;
  hint?: string;
};

export function ParticipantPicker({
  label,
  options,
  value,
  onChange,
  placeholder = "Cari anggota...",
  loading = false,
  disabled = false,
  error,
  hint,
}: ParticipantPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const selectAllId = useId();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) {
        return;
      }

      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedSet = useMemo(() => new Set(value), [value]);
  const selectableValues = useMemo(() => options.map((option) => option.value), [options]);
  const isAllSelected = useMemo(() => {
    if (options.length === 0) {
      return false;
    }

    return options.every((option) => selectedSet.has(option.value));
  }, [options, selectedSet]);

  const selectedOptions = useMemo(
    () => options.filter((option) => selectedSet.has(option.value)),
    [options, selectedSet],
  );

  const filteredOptions = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return options.filter((option) => {
      if (selectedSet.has(option.value)) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      return option.label.toLowerCase().includes(keyword);
    });
  }, [options, query, selectedSet]);

  const addParticipant = (memberId: string) => {
    if (selectedSet.has(memberId)) {
      return;
    }

    onChange([...value, memberId]);
    setQuery("");
  };

  const removeParticipant = (memberId: string) => {
    onChange(value.filter((id) => id !== memberId));
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      onChange(selectableValues);
      return;
    }

    onChange([]);
  };

  return (
    <div className="space-y-1.5" ref={containerRef}>
      {label ? <p className="text-sm font-medium text-slate-700">{label}</p> : null}

      <div
        className={cn(
          "rounded-md border border-slate-300 bg-white p-2",
          error && "border-red-300",
          disabled && "cursor-not-allowed bg-slate-50",
        )}
      >
        <div className="mb-2 rounded-md border border-slate-200 bg-slate-50/70 px-3 py-2">
          <label
            htmlFor={selectAllId}
            className={cn(
              "flex items-center gap-2 text-sm text-slate-700",
              disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer",
            )}
          >
            <input
              id={selectAllId}
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              checked={isAllSelected}
              disabled={disabled || options.length === 0}
              onChange={(event) => toggleSelectAll(event.target.checked)}
            />
            <span>Pilih semua anggota</span>
          </label>
          <p className="mt-1 text-xs text-slate-500">
            Gunakan jika biaya berlaku untuk semua peserta.
          </p>
        </div>

        <div className="mb-2 flex flex-wrap gap-2">
          {selectedOptions.length > 0 ? (
            selectedOptions.map((option) => (
              <Badge key={option.value} className="gap-1 bg-slate-100 text-slate-700">
                {option.label}
                {!disabled ? (
                  <button
                    type="button"
                    onClick={() => removeParticipant(option.value)}
                    className="rounded p-0.5 hover:bg-slate-200"
                    aria-label={`Hapus ${option.label}`}
                  >
                    <XMarkIcon className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </Badge>
            ))
          ) : (
            <p className="text-xs text-slate-500">Belum ada anggota dipilih</p>
          )}
        </div>

        <div className="relative">
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            disabled={disabled}
          />

          {open && !disabled ? (
            <div className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-slate-200 bg-white py-1 shadow-sm">
              {loading ? (
                <div className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500">
                  <Spinner className="h-4 w-4" />
                  Loading members...
                </div>
              ) : filteredOptions.length === 0 ? (
                <p className="px-3 py-2 text-sm text-slate-500">Tidak ada member.</p>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                    disabled={disabled}
                    onClick={() => addParticipant(option.value)}
                  >
                    {option.label}
                  </button>
                ))
              )}
            </div>
          ) : null}
        </div>

        {selectedOptions.length > 0 && !disabled ? (
          <button
            type="button"
            className="mt-2 text-xs text-slate-500 hover:text-slate-700"
            onClick={() => onChange([])}
          >
            Clear selected
          </button>
        ) : null}
      </div>

      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      {!error && hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}
