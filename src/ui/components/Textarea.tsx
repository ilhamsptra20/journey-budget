import { TextareaHTMLAttributes, forwardRef } from "react";

import { cn } from "@/ui/utils/cn";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const textAreaId = id ?? props.name;

    return (
      <label className="block space-y-1.5 text-sm" htmlFor={textAreaId}>
        {label ? <span className="font-medium text-slate-700">{label}</span> : null}
        <textarea
          id={textAreaId}
          ref={ref}
          className={cn(
            "min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100",
            error && "border-red-300 focus:border-red-500 focus:ring-red-100",
            className,
          )}
          {...props}
        />
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </label>
    );
  },
);

Textarea.displayName = "Textarea";
