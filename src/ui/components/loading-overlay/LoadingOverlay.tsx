import { Spinner } from "@/ui/components/Spinner";
import { cn } from "@/ui/utils/cn";

type LoadingOverlayProps = {
  show: boolean;
  text?: string;
  className?: string;
};

export function LoadingOverlay({ show, text = "Menyimpan data...", className }: LoadingOverlayProps) {
  if (!show) {
    return null;
  }

  return (
    <div
      className={cn(
        "absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-[1px]",
        className,
      )}
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
        <Spinner className="h-4 w-4" />
        <span>{text}</span>
      </div>
    </div>
  );
}
