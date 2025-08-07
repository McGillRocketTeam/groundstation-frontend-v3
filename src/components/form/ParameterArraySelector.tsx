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
import { LegacyParameterType } from "@/cards/parameterTable/schema";

type UserModifiedParameter = { 
  friendlyName: string, 
  parameter: Parameter 
};

export function ParameterArraySelector({
  value,
  onValueChange,
}: {
  value: LegacyParameterType[];
  onValueChange: (value: UserModifiedParameter[]) => void;
}) {
  const [selectedParameters, setSelectedParameters] = useState<UserModifiedParameter[]>([]);


  // Parameters are not stored locally with meta information.
  // If there is existing parameters we must their fetch this 
  // metadata on load from the api.
  useEffect(() => {
    async function fetchOriginalParams() {
      if (value !== undefined && value.length > 0) {
        const originalParameters = await yamcs.getParametersBatch(
          "gs_backend",
          {
            id: value.map((param) => ({ name: typeof param === "string" ? param : param.qualifiedName })),
          },
        );

        // If the initial data is empty but we know it can be updated
        if (selectedParameters.length == 0) {
          const newSelectedParameters: UserModifiedParameter[] = originalParameters.map((obj, index) => ({
            friendlyName: typeof value[index] === "string" ? value[index] : value[index].friendlyName,
            parameter: obj.parameter
          }))
          setSelectedParameters(newSelectedParameters);
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
        {selectedParameters.map((param, index) => (
          <TableRow key={param.parameter.qualifiedName}>
                  <input
                    className="focus:outline-none w-full p-2"
                    value={param.friendlyName}
                    onChange={(e) => {
                      const newLabel = e.target.value;
                      const updatedParams = selectedParameters.map((param, i) =>
                        i === index ? { ...param, friendlyName: newLabel } : param,
                      );
                      setSelectedParameters(updatedParams);
                    }}
                    // ref={isLastRow ? lastInputRef : null}
                  />
            <TableCell className="text-center">
              {param.parameter.type?.unitSet?.map((u) => u.unit).join("/")}
            </TableCell>
            <TableCell className="w-10 p-0" colSpan={3}>
              <button
                onClick={() =>
                  setSelectedParameters((prior) =>
                    prior.filter(
                      (p) => p.parameter.qualifiedName !== param.parameter.qualifiedName,
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
              filterOut={selectedParameters.map((p) => p.parameter.qualifiedName)}
              onSelect={(p) => setSelectedParameters((prior) => [
                  ...prior, {
                    friendlyName: p.qualifiedName,
                    parameter: p
                  }]
              )}
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
