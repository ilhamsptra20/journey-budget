import { HTMLAttributes } from "react";

import { cn } from "@/ui/utils/cn";

type AlertProps = HTMLAttributes<HTMLDivElement> & {
  tone?: "info" | "danger" | "success" | "warning";
};

const toneStyles: Record<NonNullable<AlertProps["tone"]>, string> = {
  info: "border-slate-200 bg-slate-50 text-slate-700",
  danger: "border-red-200 bg-red-50 text-red-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
};

export function Alert({ className, tone = "info", ...props }: AlertProps) {
  return (
    <div
      className={cn("rounded-md border px-3 py-2 text-sm", toneStyles[tone], className)}
      {...props}
    />
  );
}
