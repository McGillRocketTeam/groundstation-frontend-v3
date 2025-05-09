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

type ParameterSelectorProps = {
  children: ReactNode;
  onSelect: (parameter: Parameter) => void;
  filterOut?: Parameter[];
  asChild?: boolean;
};

export function ParameterSelector({
  children,
  onSelect,
  filterOut = [],
  asChild,
}: ParameterSelectorProps) {
  const [open, setOpen] = useState(false);
  const { data } = useQuery({
    queryKey: ["parameters"],
    queryFn: async () => {
      return await yamcs.getParameters("gs_backend", { limit: 1000 });
    },
  });

  // Create a Set for fast lookup of excluded qualifiedNames
  const excluded = new Set(filterOut.map((p) => p.qualifiedName));

  // Filter parameters
  const filteredParameters =
    data?.parameters?.filter((p) => !excluded.has(p.qualifiedName)) ?? [];

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild={asChild}>{children}</PopoverTrigger>
      <PopoverContent className="w-full max-w-none p-0">
        <Command>
          <CommandInput placeholder="Search parameter..." />
          <CommandList>
            <CommandEmpty>No parameter found.</CommandEmpty>
            <CommandGroup>
              {filteredParameters.map((parameter) => (
                <CommandItem
                  key={parameter.qualifiedName}
                  value={parameter.qualifiedName}
                  onSelect={() => {
                    onSelect(parameter);
                    setOpen(false);
                  }}
                >
                  {parameter.qualifiedName}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
