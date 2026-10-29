import * as React from "react";
import { useState } from "react";
import { CheckIcon, ChevronDownIcon, SearchIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  value?: string;
  onChange: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  /** Small caption rendered above the value (hero search pill style). */
  label?: string;
  icon?: LucideIcon;
  className?: string;
  popoverClassName?: string;
  disabled?: boolean;
  align?: "start" | "center" | "end";
}

/**
 * Type-to-filter dropdown built on Radix Popover. Use it instead of `Select`
 * for long lists so users never have to scroll-and-hunt.
 */
export function Combobox({
  value,
  onChange,
  options,
  placeholder = "Select…",
  searchPlaceholder = "Type to search…",
  emptyText = "No results.",
  label,
  icon: Icon,
  className,
  popoverClassName,
  disabled,
  align = "start",
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = options.find((o) => o.value === value);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  const choose = (v: string) => {
    onChange(v);
    close();
  };

  const pill = Boolean(Icon || label);

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setQuery("");
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          disabled={disabled}
          className={cn(
            "group flex w-full items-center justify-between gap-2 rounded-md border border-input bg-input/20 px-3 text-sm whitespace-nowrap transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50",
            pill ? "py-1" : "h-9 py-1.5",
            className,
          )}
        >
          {pill ? (
            <span className="flex w-full min-w-0 items-center gap-3">
              {Icon && <Icon className="hidden size-5 shrink-0 text-primary lg:block" />}
              <span className="flex min-w-0 flex-1 flex-col text-left">
                {label && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {label}
                  </span>
                )}
                <span
                  className={cn(
                    "truncate text-sm font-semibold",
                    selected ? "text-foreground" : "font-normal text-muted-foreground",
                  )}
                >
                  {selected ? selected.label : placeholder}
                </span>
              </span>
              <ChevronDownIcon className="pointer-events-none size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </span>
          ) : (
            <>
              <span
                className={cn(
                  "truncate",
                  selected ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {selected ? selected.label : placeholder}
              </span>
              <ChevronDownIcon className="pointer-events-none size-3.5 shrink-0 text-muted-foreground" />
            </>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align={align}
        className={cn("w-[var(--radix-popover-trigger-width)] min-w-48 p-0", popoverClassName)}
      >
        <div className="flex items-center border-b px-3">
          <SearchIcon className="mr-2 size-4 shrink-0 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && filtered.length > 0) {
                e.preventDefault();
                choose(filtered[0].value);
              }
            }}
            placeholder={searchPlaceholder}
            className="h-9 border-0 px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <div className="max-h-64 overflow-y-auto p-1 scrollbar-thin">
          {filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">{emptyText}</p>
          ) : (
            filtered.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => choose(o.value)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                  o.value === value && "bg-accent font-medium",
                )}
              >
                <CheckIcon
                  className={cn("size-4 shrink-0", o.value === value ? "opacity-100" : "opacity-0")}
                />
                <span className="truncate">{o.label}</span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default Combobox;
