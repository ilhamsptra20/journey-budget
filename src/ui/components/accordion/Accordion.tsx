"use client";

import {
  ButtonHTMLAttributes,
  Children,
  HTMLAttributes,
  ReactNode,
  createContext,
  isValidElement,
  useContext,
  useMemo,
  useState,
} from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

import { cn } from "@/ui/utils/cn";

type AccordionProps = {
  children: ReactNode;
  multiple?: boolean;
  defaultOpen?: boolean;
  disabled?: boolean;
  className?: string;
};

type AccordionItemProps = {
  value: string;
  children: ReactNode;
  defaultOpen?: boolean;
  disabled?: boolean;
  className?: string;
};

type AccordionTriggerProps = ButtonHTMLAttributes<HTMLButtonElement>;

type AccordionContentProps = HTMLAttributes<HTMLDivElement>;

type AccordionContextValue = {
  multiple: boolean;
  disabled: boolean;
  isOpen: (value: string) => boolean;
  toggle: (value: string) => void;
};

type AccordionItemContextValue = {
  open: boolean;
  disabled: boolean;
  toggle: () => void;
};

const AccordionContext = createContext<AccordionContextValue | null>(null);
const AccordionItemContext = createContext<AccordionItemContextValue | null>(null);

function getAccordionItemValues(children: ReactNode) {
  const values: string[] = [];

  Children.forEach(children, (child) => {
    if (!isValidElement<AccordionItemProps>(child)) {
      return;
    }

    const value = child.props.value;
    if (value) {
      values.push(value);
    }
  });

  return values;
}

function getDefaultOpenValues(children: ReactNode, openAll: boolean) {
  const values: string[] = [];

  Children.forEach(children, (child) => {
    if (!isValidElement<AccordionItemProps>(child)) {
      return;
    }

    if (openAll || child.props.defaultOpen) {
      values.push(child.props.value);
    }
  });

  return values;
}

export function Accordion({
  children,
  multiple = false,
  defaultOpen = false,
  disabled = false,
  className,
}: AccordionProps) {
  const initialOpenValues = useMemo(
    () => getDefaultOpenValues(children, defaultOpen),
    [children, defaultOpen],
  );
  const [openValues, setOpenValues] = useState<string[]>(
    multiple ? initialOpenValues : initialOpenValues.slice(0, 1),
  );

  const itemValues = useMemo(() => getAccordionItemValues(children), [children]);

  const contextValue = useMemo<AccordionContextValue>(
    () => ({
      multiple,
      disabled,
      isOpen: (value) => itemValues.includes(value) && openValues.includes(value),
      toggle: (value) => {
        if (disabled) {
          return;
        }

        setOpenValues((prev) => {
          const isOpen = prev.includes(value);

          if (multiple) {
            return isOpen ? prev.filter((item) => item !== value) : [...prev, value];
          }

          return isOpen ? [] : [value];
        });
      },
    }),
    [disabled, itemValues, multiple, openValues],
  );

  return (
    <AccordionContext.Provider value={contextValue}>
      <div className={cn("space-y-2", className)}>{children}</div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({
  value,
  children,
  className,
  disabled = false,
}: AccordionItemProps) {
  const accordion = useContext(AccordionContext);
  if (!accordion) {
    throw new Error("AccordionItem must be used inside Accordion");
  }

  const itemDisabled = accordion.disabled || disabled;
  const open = accordion.isOpen(value);

  const itemContext = useMemo<AccordionItemContextValue>(
    () => ({
      open,
      disabled: itemDisabled,
      toggle: () => {
        if (!itemDisabled) {
          accordion.toggle(value);
        }
      },
    }),
    [accordion, itemDisabled, open, value],
  );

  return (
    <AccordionItemContext.Provider value={itemContext}>
      <div
        className={cn(
          "overflow-hidden rounded-lg border border-slate-200 bg-white",
          itemDisabled && "opacity-70",
          className,
        )}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

export function AccordionTrigger({
  children,
  className,
  disabled,
  type,
  ...props
}: AccordionTriggerProps) {
  const item = useContext(AccordionItemContext);
  if (!item) {
    throw new Error("AccordionTrigger must be used inside AccordionItem");
  }

  const triggerDisabled = item.disabled || disabled;

  return (
    <button
      type={type ?? "button"}
      className={cn(
        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-inset",
        triggerDisabled && "cursor-not-allowed hover:bg-white",
        className,
      )}
      disabled={triggerDisabled}
      aria-expanded={item.open}
      onClick={(event) => {
        props.onClick?.(event);
        if (!event.defaultPrevented) {
          item.toggle();
        }
      }}
      {...props}
    >
      <div className="min-w-0 flex-1">{children}</div>
      <ChevronDownIcon
        className={cn(
          "mt-0.5 h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200",
          item.open && "rotate-180",
        )}
      />
    </button>
  );
}

export function AccordionContent({ children, className, ...props }: AccordionContentProps) {
  const item = useContext(AccordionItemContext);
  if (!item) {
    throw new Error("AccordionContent must be used inside AccordionItem");
  }

  return (
    <div
      className={cn(
        "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
        item.open ? "grid-rows-[1fr] opacity-100" : "pointer-events-none grid-rows-[0fr] opacity-0",
      )}
      aria-hidden={!item.open}
      {...props}
    >
      <div className={cn("overflow-hidden", className)}>{children}</div>
    </div>
  );
}
