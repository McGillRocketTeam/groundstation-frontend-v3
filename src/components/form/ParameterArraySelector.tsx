import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useEffect, useState } from "react";
import { Parameter } from "@/lib/yamcsClient/lib/client";
import { Cross2Icon, PlusIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { ParameterSelector } from "./ParameterSelector";
import { yamcs } from "@/lib/yamcsClient/api";

export function ParameterArraySelector({
  value,
  onValueChange,
}: {
  value: string[];
  onValueChange: (value: Parameter[]) => void;
}) {
  const [selectedParameters, setSelectedParameters] = useState<Parameter[]>([]);

  useEffect(() => {
    async function fetchOriginalParams() {
      if (value !== undefined && value.length > 0) {
        const originalParameters = await yamcs.getParametersBatch(
          "gs_backend",
          {
            id: value.map((param) => ({ name: param })),
          },
        );

        if (selectedParameters.length == 0) {
          setSelectedParameters(originalParameters.map((obj) => obj.parameter));
        }
      }
    }

    fetchOriginalParams();
  }, []);

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
              filterOut={selectedParameters.map((p) => p.qualifiedName)}
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
