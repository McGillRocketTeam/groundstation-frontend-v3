import { IDockviewPanelProps } from "dockview-react";
import { ParameterTableCardParams } from "./schema";
import { useDoubleParameterSubscription } from "@/hooks/use-double-parameter";
import { cn, extractValue } from "@/lib/utils";
import {
  ParameterValue,
  SubscribedParameterInfo,
} from "@/lib/yamcsClient/lib/client";

// Helper component to render a single parameter value
const ParameterValueCell = ({
  className,
  value,
  paramInfo,
}: {
  className?: string;
  value?: ParameterValue;
  paramInfo?: SubscribedParameterInfo;
}) => {
  if (!value) {
    return <span className={cn("text-muted-foreground", className)}>N/A</span>;
  }

  if (value.engValue.type === "ENUMERATED") {
    return (
      <span className={className}>
        {paramInfo?.enumValues
          ?.find((v) => v.value === extractValue(value.rawValue)?.toString())
          ?.label.toLocaleUpperCase() ??
          `UNDEF ${extractValue(value.rawValue)}`}
      </span>
    );
  }

  return (
    <span className={className}>
      {extractValue(value.engValue)?.toString().toLocaleUpperCase()}
      {paramInfo?.units}
    </span>
  );
};

export const ParameterTableCard = ({
  params,
}: IDockviewPanelProps<ParameterTableCardParams>) => {
  const { values, info } = useDoubleParameterSubscription(params.parameters);

  return (
    <div className="grid grid-cols-[1fr_auto_auto] gap-0">
      {/* Header row */}
      <div className="p-2 text-xs text-muted-foreground font-medium border-b">
        Parameter
      </div>
      <div className="p-2 text-xs text-muted-foreground font-medium border-b text-right">
        FC433
      </div>
      <div className="p-2 text-xs text-muted-foreground font-medium border-b text-right">
        FC903
      </div>

      {/* Parameter rows */}
      {params.parameters.map((parameter) => {
        const paramResult = values[parameter];
        const paramInfo = info[parameter];

        return (
          <div key={parameter} className="group contents">
            {/* Parameter name */}
            <div className="group-hover:bg-muted p-2 border-b grid items-center truncate">
              <div className="overflow-hidden text-sm text-ellipsis whitespace-nowrap">
                {parameter}
              </div>
            </div>

            {/* FC433 value or span for non-FC parameters */}
            <div
              className={cn(
                "group-hover:bg-muted p-2 border-b text-right whitespace-nowrap grid items-center",
                paramResult?.type === "standard" && "col-span-2",
              )}
            >
              {paramResult?.type === "flightComputer" ? (
                <ParameterValueCell
                  value={paramResult.fc433}
                  paramInfo={
                    paramInfo?.type === "flightComputer"
                      ? paramInfo.fc433
                      : undefined
                  }
                />
              ) : (
                <ParameterValueCell
                  value={
                    paramResult?.type === "standard"
                      ? paramResult.value
                      : undefined
                  }
                  paramInfo={
                    paramInfo?.type === "standard" ? paramInfo.info : undefined
                  }
                />
              )}
            </div>

            {/* FC903 value or empty for non-FC parameters */}
            {paramResult?.type === "flightComputer" && (
              <div className="group-hover:bg-muted p-2 border-b text-right whitespace-nowrap grid items-center pl-12">
                <ParameterValueCell
                  value={paramResult.fc903}
                  paramInfo={
                    paramInfo?.type === "flightComputer"
                      ? paramInfo.fc903
                      : undefined
                  }
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
