import { ButtonHTMLAttributes } from "react";

import { cn } from "@/ui/utils/cn";

type TabItem = {
  key: string;
  label: string;
};

type TabsProps = {
  items: TabItem[];
  value: string;
  onChange: (key: string) => void;
  className?: string;
};

export function Tabs({ items, value, onChange, className }: TabsProps) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <div className="flex min-w-max gap-2 pb-1">
        {items.map((tab) => (
          <TabButton
            key={tab.key}
            type="button"
            active={tab.key === value}
            onClick={() => onChange(tab.key)}
          >
            {tab.label}
          </TabButton>
        ))}
      </div>
    </div>
  );
}

type TabButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

function TabButton({ className, active, ...props }: TabButtonProps) {
  return (
    <button
      className={cn(
        "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
        className,
      )}
      {...props}
    />
  );
}
