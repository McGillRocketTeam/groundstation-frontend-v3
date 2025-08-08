import { useQuery } from "@tanstack/react-query";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { yamcs } from "@/lib/yamcsClient/api";
import { ReactNode, useState } from "react";
import { Parameter } from "@/lib/yamcsClient/lib/client";
import { anonymizeParameter } from "@/lib/yamcsCommands/format-command-name";

type ParameterSelectorProps = {
  children: ReactNode;
  onSelect: (parameter: Parameter) => void;
  filterOut?: string[];
  filter?: (value: Parameter, index: number, array: Parameter[]) => unknown;
  asChild?: boolean;
  disablePairs?: boolean
};

export function ParameterSelector({
  children,
  onSelect,
  filterOut = [],
  filter,
  asChild,
  disablePairs = true
}: ParameterSelectorProps) {
  const [open, setOpen] = useState(false);
  const { data } = useQuery({
    queryKey: ["parameters"],
    queryFn: async () => {
     const params = await yamcs.getParameters("gs_backend", { limit: 1000 })

    if (disablePairs) {
        return params.parameters?.filter((p) => !p.qualifiedName.includes("433"));
      } else {
        return params.parameters
      }
    },
  });

  // Create a Set for fast lookup of excluded qualifiedNames
  const excluded = new Set(filterOut);

  // Filter parameters
  let filteredParameters = data?.filter((p) => !excluded.has(p.qualifiedName));

  if (filter) {
    filteredParameters = filteredParameters?.filter(filter);
  }

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild={asChild}>{children}</PopoverTrigger>
      <PopoverContent className="w-full max-w-none p-0">
        <Command>
          <CommandInput placeholder="Search parameter..." />
          <CommandList>
            <CommandEmpty>No parameter found.</CommandEmpty>
            <CommandGroup>
              {(filteredParameters ?? []).map((parameter) => (
                <CommandItem
                  key={parameter.qualifiedName}
                  value={parameter.qualifiedName}
                  onSelect={() => {
                    onSelect(parameter);
                    setOpen(false);
                  }}
                >
                  {disablePairs ? anonymizeParameter(parameter.qualifiedName) : parameter.qualifiedName}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
