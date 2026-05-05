"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckIcon, ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/outline";

import { Spinner } from "@/ui/components/Spinner";
import { cn } from "@/ui/utils/cn";

export type AutocompleteOption = {
  value: string;
  label: string;
};

type AutocompleteProps = {
  label?: string;
  value: AutocompleteOption | null;
  options: AutocompleteOption[];
  onChange: (option: AutocompleteOption | null) => void;
  onCreateOption?: (keyword: string) => Promise<AutocompleteOption>;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  createText?: (keyword: string) => string;
  loading?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  error?: string;
  hint?: string;
  onCreateError?: (message: string) => void;
};

export function Autocomplete({
  label,
  value,
  options,
  onChange,
  onCreateOption,
  placeholder = "Pilih item",
  searchPlaceholder = "Cari...",
  emptyText = "Tidak ada hasil",
  createText = (keyword) => `Buat item baru: ${keyword}`,
  loading = false,
  disabled = false,
  clearable = true,
  error,
  hint,
  onCreateError,
}: AutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery(value?.label ?? "");
  }, [value?.label]);

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

  const filteredOptions = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) {
      return options;
    }

    return options.filter((option) => option.label.toLowerCase().includes(keyword));
  }, [options, query]);

  const canCreate = Boolean(onCreateOption && query.trim() && filteredOptions.length === 0);

  const totalNavigable = filteredOptions.length + (canCreate ? 1 : 0);

  const handleSelect = (option: AutocompleteOption | null) => {
    onChange(option);
    setOpen(false);
    setHighlightIndex(-1);
  };

  const handleCreate = async () => {
    if (!onCreateOption) {
      return;
    }

    const keyword = query.trim();
    if (!keyword) {
      return;
    }

    setCreating(true);
    setCreateError("");

    try {
      const created = await onCreateOption(keyword);
      handleSelect(created);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Gagal membuat item baru";
      setCreateError(message);
      onCreateError?.(message);
    } finally {
      setCreating(false);
    }
  };

  const handleKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      setOpen(true);
      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightIndex((prev) => {
        if (totalNavigable <= 0) {
          return -1;
        }

        return prev >= totalNavigable - 1 ? 0 : prev + 1;
      });
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightIndex((prev) => {
        if (totalNavigable <= 0) {
          return -1;
        }

        return prev <= 0 ? totalNavigable - 1 : prev - 1;
      });
      return;
    }

    if (event.key === "Enter") {
      if (!open) {
        return;
      }

      event.preventDefault();

      if (highlightIndex >= 0 && highlightIndex < filteredOptions.length) {
        handleSelect(filteredOptions[highlightIndex]);
        return;
      }

      if (canCreate && highlightIndex === filteredOptions.length) {
        await handleCreate();
        return;
      }

      if (filteredOptions.length > 0) {
        handleSelect(filteredOptions[0]);
        return;
      }

      if (canCreate) {
        await handleCreate();
      }
    }
  };

  return (
    <div className="space-y-1.5" ref={containerRef}>
      {label ? <p className="text-sm font-medium text-slate-700">{label}</p> : null}

      <div
        className={cn(
          "relative rounded-md border border-slate-300 bg-white",
          error && "border-red-300",
          disabled && "cursor-not-allowed bg-slate-50",
        )}
      >
        <div className="flex items-center gap-1 px-3 py-2">
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setCreateError("");
              setOpen(true);
              setHighlightIndex(-1);
              if (!event.target.value && value) {
                onChange(null);
              }
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(event) => {
              void handleKeyDown(event);
            }}
            placeholder={value ? searchPlaceholder : placeholder}
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            disabled={disabled || creating}
          />
          {loading || creating ? <Spinner className="h-4 w-4" /> : null}
          {clearable && value ? (
            <button
              type="button"
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              onClick={() => {
                onChange(null);
                setQuery("");
              }}
              aria-label="Clear selection"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          ) : null}
          <ChevronDownIcon className="h-4 w-4 text-slate-400" />
        </div>

        {open ? (
          <div className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-slate-200 bg-white py-1 shadow-sm">
            {filteredOptions.map((option, index) => {
              const active = highlightIndex === index;
              const selected = value?.value === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-2 text-left text-sm text-slate-700",
                    active ? "bg-slate-100" : "hover:bg-slate-50",
                  )}
                  onMouseEnter={() => setHighlightIndex(index)}
                  onClick={() => handleSelect(option)}
                >
                  <span>{option.label}</span>
                  {selected ? <CheckIcon className="h-4 w-4 text-emerald-600" /> : null}
                </button>
              );
            })}

            {canCreate ? (
              <button
                type="button"
                className={cn(
                  "flex w-full items-center justify-between px-3 py-2 text-left text-sm text-emerald-700",
                  highlightIndex === filteredOptions.length ? "bg-emerald-50" : "hover:bg-emerald-50",
                )}
                onMouseEnter={() => setHighlightIndex(filteredOptions.length)}
                onClick={() => {
                  void handleCreate();
                }}
              >
                {createText(query.trim())}
              </button>
            ) : null}

            {!canCreate && filteredOptions.length === 0 ? (
              <p className="px-3 py-2 text-sm text-slate-500">{emptyText}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      {!error && createError ? <p className="text-xs text-red-600">{createError}</p> : null}
      {!error && !createError && hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}
