"use client";

import { ReactNode, useCallback, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

import { LoadingOverlay } from "@/ui/components/loading-overlay/LoadingOverlay";
import { cn } from "@/ui/utils/cn";

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  isSubmitting?: boolean;
  disableClose?: boolean;
  loadingText?: string;
};

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  className,
  isSubmitting = false,
  disableClose = false,
  loadingText,
}: ModalProps) {
  const preventClose = disableClose || isSubmitting;

  const handleClose = useCallback(() => {
    if (preventClose) {
      return;
    }

    onClose();
  }, [onClose, preventClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      handleClose();
    };

    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [handleClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-slate-900/40 p-4 sm:p-6"
      onMouseDown={(event) => {
        if (event.target !== event.currentTarget) {
          return;
        }

        handleClose();
      }}
    >
      <div
        className={cn(
          "relative flex max-h-[92vh] w-full min-w-0 max-w-2xl flex-col overflow-hidden rounded-lg border border-slate-200 bg-white",
          className,
        )}
      >
        <LoadingOverlay show={isSubmitting} text={loadingText} />
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={preventClose}
            onClick={handleClose}
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
