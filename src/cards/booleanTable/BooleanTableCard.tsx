import { IDockviewPanelProps } from "dockview-react";
import { BooleanCardParams } from "./schema";
import { useQuery } from "@tanstack/react-query";
import { yamcs } from "@/lib/yamcsClient/api";
import { useParameterSubscription } from "@/hooks/use-parameter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ParameterValue } from "@/lib/yamcsClient/lib/client";
import { QualifiedParameterName } from "@/lib/schemas";

export const BooleanTableCard = (
  props: IDockviewPanelProps<BooleanCardParams>,
) => {
  const { data } = useQuery({
    queryKey: props.params.parameters,
    queryFn: async () => {
      const parameterResponse = await yamcs.getParameters("gs_backend", {
        limit: 200,
      });

      const parameters = parameterResponse.parameters?.filter((p) =>
        props.params.parameters.some((pr) => p.qualifiedName.includes(pr)),
      );

      const parameterGroups = props.params.parameters.map((groupId) => {
        const relevantParams = parameters?.filter((p) =>
          p.qualifiedName.includes(groupId),
        );

        function includes(query: string) {
          return (
            relevantParams?.find((p) => p.qualifiedName.includes(query))
              ?.qualifiedName ?? QualifiedParameterName.parse("")
          );
        }

        return {
          id: groupId,
          armedHW: includes("armed_HW"),
          armedSW: includes("armed_SW"),
          continuityHW: includes("continuity_HW"),
          energizedSW: includes("energized_SW"),
          energizedCurrentHW: includes("energizedCurrent_HW"),
          energizedGateHW: includes("energizedGate_HW"),
        };
      });

      return {
        parameters,
        parameterGroups,
      };
    },
  });

  const { values } = useParameterSubscription(
    data?.parameters?.map((p) => p.qualifiedName),
  );

  return (
    <Table>
      <TableHeader>
        <TableRow className="text-xs p-0">
          <TableHead className="h-2 border-t border-muted"></TableHead>
          <TableHead
            className="py-1 h-min border text-center bg-border"
            colSpan={3}
          >
            ENERGIZED
          </TableHead>
        </TableRow>
        <TableRow className="border-b-2 text-sm">
          <TableHead>Parameter</TableHead>
          <TableHead className="w-[4.5rem] border text-center">
            SOFTWARE
          </TableHead>
          <TableHead className="w-[4.5rem] border text-center">
            CURRENT
          </TableHead>
          <TableHead className="w-[4.5rem] border text-center">GATE</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.parameterGroups.map((group) => (
          <TableRow key={group.id}>
            <TableCell className="py-1 border">{group.id}</TableCell>
            <TableCell className="border p-1 text-center">
              <BoolValue value={values[group.energizedSW]} />
            </TableCell>
            <TableCell className="border p-1 text-center">
              <BoolValue value={values[group.energizedGateHW]} />
            </TableCell>
            <TableCell className="border p-1 text-center">
              <BoolValue value={values[group.energizedCurrentHW]} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export function BoolValue({ value }: { value: ParameterValue | undefined }) {
  if (typeof value?.engValue.booleanValue !== "undefined") {
    return (
      <div
        data-state={value.engValue.booleanValue}
        className="data-[state=true]:bg-green-700 bg-red-700 p-1 text-white min-w-[4.5rem] text-center"
      >
        {value.engValue.booleanValue.toString().toLocaleUpperCase()}
      </div>
    );
  } else {
    return (
      <div className="text-muted-foreground min-w-[3.25rem] text-center font-[350]">
        N/A
      </div>
    );
  }
}
