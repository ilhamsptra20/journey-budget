import { SelectHTMLAttributes, forwardRef } from "react";

import { cn } from "@/ui/utils/cn";

type Option = {
  label: string;
  value: string;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  options: Option[];
  placeholder?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    const selectId = id ?? props.name;

    return (
      <label className="block space-y-1.5 text-sm" htmlFor={selectId}>
        {label ? <span className="font-medium text-slate-700">{label}</span> : null}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100",
            error && "border-red-300 focus:border-red-500 focus:ring-red-100",
            className,
          )}
          {...props}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </label>
    );
  },
);

Select.displayName = "Select";
