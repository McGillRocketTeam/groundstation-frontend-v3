import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
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
import { ReactNode, useEffect, useState } from "react";
import { Parameter } from "@/lib/yamcsClient/lib/client";
import { Cross2Icon, PlusIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

export function ParameterArraySelector({
  onValueChange,
}: {
  onValueChange: (value: Parameter[]) => void;
}) {
  const [selectedParameters, setSelectedParameters] = useState<Parameter[]>([]);

  useEffect(() => {
    onValueChange(selectedParameters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedParameters]);

  return (
    <Table className="border">
      {selectedParameters.length > 0 && (
        <TableHeader>
          <TableRow>
            <TableHead>Parameter</TableHead>
            <TableHead className="text-center">Units</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
      )}
      <TableBody>
        {selectedParameters.map((parameter) => (
          <TableRow key={parameter.qualifiedName}>
            <TableCell>{parameter.qualifiedName}</TableCell>
            <TableCell className="text-center">
              {parameter.type?.unitSet?.map((u) => u.unit).join("/")}
            </TableCell>
            <TableCell className="w-10 p-0" colSpan={3}>
              <button
                onClick={() =>
                  setSelectedParameters((prior) =>
                    prior.filter(
                      (p) => p.qualifiedName !== parameter.qualifiedName,
                    ),
                  )
                }
                type="button"
                className="hover:text-destructive p-2"
              >
                <Cross2Icon />
              </button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter
        className={cn(selectedParameters.length === 0 && "border-t-0")}
      >
        <TableRow>
          <TableCell className="p-0" colSpan={3}>
            <ParameterSelector
              filterOut={selectedParameters}
              onSelect={(p) => setSelectedParameters((prior) => [...prior, p])}
              asChild
            >
              <button
                type="button"
                className="flex w-full flex-row items-center justify-between p-2"
              >
                Add Parameter <PlusIcon className="w-8" />
              </button>
            </ParameterSelector>
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}

type ParameterSelectorProps = {
  children: ReactNode;
  onSelect: (parameter: Parameter) => void;
  filterOut?: Parameter[];
  asChild?: boolean;
};

function ParameterSelector({
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
