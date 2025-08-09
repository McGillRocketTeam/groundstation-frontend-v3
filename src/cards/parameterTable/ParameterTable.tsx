import { IDockviewPanelProps } from "dockview-react";
import { ParameterTableCardParams } from "./schema";
import { useDoubleParameterSubscription } from "@/hooks/use-double-parameter";
import { cn, extractValue, getPairedQualifiedName } from "@/lib/utils";
import {
  ParameterValue,
  SubscribedParameterInfo,
  Value,
} from "@/lib/yamcsClient/lib/client";
import { useParameterSubscription } from "@/hooks/use-parameter";
import { QualifiedParameterNameType } from "@/lib/schemas";
import { BoolValue } from "../booleanTable/BooleanTableCard";

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
  return (
    <div className="h-full overflow-y-scroll">
      <div className="grid grid-cols-[1fr_auto_auto] gap-0">
        {/* Header row */}
        <div className="grid grid-cols-subgrid col-span-full text-xs text-muted-foreground font-medium border-b sticky top-0 bg-background">
          <div className="p-2">Parameter</div>
          <div className="p-2">FC433</div>
          <div className="p-2">FC903</div>
        </div>

        {params.parameters.map((parameter) => (
          // Allowing for legacy string only parameters
          typeof parameter === "string" ? 
            <ParameterTableCardRow key={parameter} qualifiedName={parameter} /> :
            <ParameterTableCardRow key={parameter.qualifiedName+parameter.friendlyName} {...parameter} />
        ))}
      </div>
    </div>
  );
};

export function ParameterTableCardRow({
  friendlyName, 
  qualifiedName
}: { 
  friendlyName?: string, 
  qualifiedName: string 
}) {
  const originalParameterFC = qualifiedName.startsWith("/FC433") ? "433" : "903";

  const originalParameter = qualifiedName as QualifiedParameterNameType
  const pairedParameter = getPairedQualifiedName(qualifiedName) as QualifiedParameterNameType;

  const parameterList = [qualifiedName] as QualifiedParameterNameType[];
  if (pairedParameter !== null) {
    parameterList.push(pairedParameter);
  }
  const { values, info } = useParameterSubscription(parameterList);

  return (
    <div className="grid grid-cols-subgrid col-span-full hover:bg-muted items-center not-last:border-b">
      <div className="p-2 text-nowrap">{friendlyName ?? qualifiedName}</div>
      <div className="p-2">
        {(() => {
          const value = originalParameterFC === "433" ? values[originalParameter] : values[pairedParameter]
          const paramInfo = originalParameterFC === "433" ? info[originalParameter] : info[pairedParameter]

          return <ParameterValueDisplay value={value} info={paramInfo} />
        })()}
      </div>
      <div className="p-2 pr-4">
        {(() => {
          const value = originalParameterFC === "903" ? values[originalParameter] : values[pairedParameter]
          const paramInfo = originalParameterFC === "903" ? info[originalParameter] : info[pairedParameter]

          return <ParameterValueDisplay value={value} info={paramInfo} />
        })()}
      </div>
    </div>
  )
}

function ParameterValueDisplay({ value, info }: { value?: ParameterValue, info?: SubscribedParameterInfo }) {
  if (!value) {
    return <span className={"text-muted-foreground"}>N/A</span>;
  }

  if (value.engValue.type === "ENUMERATED") {
    return (
      <span className="text-balance">
        {info?.enumValues
          ?.find((v) => v.value === extractValue(value.rawValue)?.toString())
          ?.label.toLocaleUpperCase() ??
          `UNDEF ${extractValue(value.rawValue)}`}
      </span>
    );
  }

  if (value.engValue.type === "BOOLEAN") {
    return <BoolValue value={value} /> 
  }

  return (
    <span>
      {extractValue(value.engValue)?.toString().toLocaleUpperCase()}
      {info?.units}
    </span>
  );

}

export const OldParameterTableCard = ({
  params,
}: IDockviewPanelProps<ParameterTableCardParams>) => {
  const { values, info } = useDoubleParameterSubscription(params.parameters);

  return (
    <div className="h-full overflow-y-scroll">
      <div className="grid grid-cols-[1fr_auto_auto] gap-0">
        {/* Header row */}
        <div className="p-2 text-xs text-muted-foreground font-medium border-b sticky top-0 bg-background">
          Parameter
        </div>
        <div className="p-2 text-xs text-muted-foreground font-medium border-b text-right sticky top-0 bg-background">
          FC433
        </div>
        <div className="p-2 text-xs text-muted-foreground font-medium border-b text-right sticky top-0 bg-background">
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
                      paramInfo?.type === "standard"
                        ? paramInfo.info
                        : undefined
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
    </div>
  );
};
