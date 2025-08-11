"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";

interface AsyncMultiSelectProps {
  optionsFn: () => Promise<string[]>;
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export function AsyncMultiSelect({
  optionsFn,
  selected,
  onChange,
  placeholder = "Select items...",
}: AsyncMultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const { data: options } = useQuery({
    queryKey: ["AsyncMultiSelect"],
    queryFn: optionsFn,
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selected.length === 0 ? placeholder : `${selected.length} selected`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search items..." />
          <CommandEmpty>No items found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {options ? (
              options.map((option) => (
                <CommandItem
                  key={option}
                  onSelect={() => {
                    const isSelected = selected.includes(option);
                    const newSelected = isSelected
                      ? selected.filter((item) => item !== option)
                      : [...selected, option];
                    onChange(newSelected);
                  }}
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      selected.includes(option)
                        ? "bg-primary text-black opacity-100 text-red-500"
                        : "opacity-50 [&_svg]:invisible",
                    )}
                  >
                    <Check
                      strokeWidth={3}
                      stroke="currentColor"
                      className="size-3 p-0.25 text-primary-foreground"
                    />
                  </div>
                  {option}
                </CommandItem>
              ))
            ) : (
              <div>No Options Found</div>
            )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
