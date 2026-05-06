import { ReactNode } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

import { cn } from "@/ui/utils/cn";

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function Modal({ open, title, onClose, children, footer, className }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-slate-900/40 p-4 sm:p-6">
      <div
        className={cn(
          "flex max-h-[92vh] w-full min-w-0 max-w-2xl flex-col overflow-hidden rounded-lg border border-slate-200 bg-white",
          className,
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
            onClick={onClose}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 sm:px-5">{children}</div>
        {footer ? <div className="shrink-0 border-t border-slate-200 px-4 py-4 sm:px-5">{footer}</div> : null}
      </div>
    </div>
  );
}
