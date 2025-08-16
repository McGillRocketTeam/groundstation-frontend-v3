import { IDockviewPanelProps } from "dockview-react";
import { ParameterTableCardParams } from "./schema";
// import { useDoubleParameterSubscription } from "@/hooks/use-double-parameter";
import { extractValue, getPairedQualifiedName } from "@/lib/utils";
import {
  ParameterValue,
  SubscribedParameterInfo,
} from "@/lib/yamcsClient/lib/client";
import { useParameterSubscription } from "@/hooks/use-parameter";
import { QualifiedParameterNameType } from "@/lib/schemas";
import { BoolValue } from "../booleanTable/BooleanTableCard";

export const ParameterTableCard = ({
  params,
}: IDockviewPanelProps<ParameterTableCardParams>) => {
  return (
    <div className="h-full overflow-y-scroll">
      <div className="grid grid-cols-[1fr_auto_auto] gap-0">
        {/* Header row */}
        <div className="grid grid-cols-subgrid col-span-full text-xs text-muted-foreground font-medium border-b sticky top-0 bg-background">
          <div className="p-2">Parameter</div>
          <div className="p-2">FC435</div>
          <div className="p-2">FC903</div>
        </div>

        {params.parameters.map((parameter) =>
          // Allowing for legacy string only parameters
          typeof parameter === "string" ? (
            <ParameterTableCardRow key={parameter} qualifiedName={parameter} />
          ) : (
            <ParameterTableCardRow
              key={parameter.qualifiedName + parameter.friendlyName}
              {...parameter}
            />
          ),
        )}
      </div>
    </div>
  );
};

export function ParameterTableCardRow({
  friendlyName,
  qualifiedName,
}: {
  friendlyName?: string;
  qualifiedName: string;
}) {
  const originalParameterFC = qualifiedName.startsWith("/FC435")
    ? "435"
    : "903";

  const originalParameter = qualifiedName as QualifiedParameterNameType;
  const pairedParameter = getPairedQualifiedName(
    qualifiedName,
  ) as QualifiedParameterNameType;

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
          const value =
            originalParameterFC === "435"
              ? values[originalParameter]
              : values[pairedParameter];
          const paramInfo =
            originalParameterFC === "435"
              ? info[originalParameter]
              : info[pairedParameter];

          return <ParameterValueDisplay value={value} info={paramInfo} />;
        })()}
      </div>
      <div className="p-2 pr-4">
        {(() => {
          const value =
            originalParameterFC === "903"
              ? values[originalParameter]
              : values[pairedParameter];
          const paramInfo =
            originalParameterFC === "903"
              ? info[originalParameter]
              : info[pairedParameter];

          return <ParameterValueDisplay value={value} info={paramInfo} />;
        })()}
      </div>
    </div>
  );
}

function ParameterValueDisplay({
  value,
  info,
}: {
  value?: ParameterValue;
  info?: SubscribedParameterInfo;
}) {
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
    return <BoolValue value={value} />;
  }

  return (
    <span>
      {extractValue(value.engValue)?.toString().toLocaleUpperCase()}
      {info?.units}
    </span>
  );
}
