import { ButtonHTMLAttributes, forwardRef } from "react";

import { cn } from "@/ui/utils/cn";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "default" | "danger";
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, tone = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          tone === "danger" && "text-red-600 hover:bg-red-50",
          className,
        )}
        {...props}
      />
    );
  },
);

IconButton.displayName = "IconButton";
