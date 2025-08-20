import { IDockviewPanelProps } from "dockview-react";
import { LabjackTableCardParams } from "./schema";
import { extractValue } from "@/lib/utils";

import {
  ParameterValue,
  SubscribedParameterInfo,
} from "@/lib/yamcsClient/lib/client";
import { useParameterSubscription } from "@/hooks/use-parameter";
import { QualifiedParameterNameType } from "@/lib/schemas";

export const LabJackTableCard = ({
  params,
}: IDockviewPanelProps<LabjackTableCardParams>) => {
  return (
    <div className="h-full overflow-y-scroll">
      <div className="grid grid-cols-[1fr_auto_auto] gap-0">
        {/* Header row */}
        <div className="grid grid-cols-subgrid col-span-full text-xs text-muted-foreground font-medium border-b sticky top-0 bg-background">
          <div className="p-2">Parameter</div>
          <div className="p-2">Status</div>
        </div>

        {params.parameters.map((parameter) =>
          // Allowing for legacy string only parameters
          typeof parameter === "string" ? (
            <LabJackTableCardRow key={parameter} qualifiedName={parameter} />
          ) : (
            <LabJackTableCardRow
              key={parameter.qualifiedName + parameter.friendlyName}
              {...parameter}
            />
          ),
        )}
      </div>
    </div>
  );
};

function LabJackTableCardRow({
  friendlyName,
  qualifiedName,
}: {
  friendlyName?: string;
  qualifiedName: string;
}) {
  const { values, info } = useParameterSubscription([
    qualifiedName as QualifiedParameterNameType,
  ]);

  return (
    <div className="grid grid-cols-subgrid col-span-full hover:bg-muted items-center not-last:border-b">
      <div className="p-2 text-nowrap">{friendlyName ?? qualifiedName}</div>
      <div className="p-2">
        {Object.entries(values).map(([qualifiedName, parameterValue]) => (
          <ParameterValueDisplay
            value={parameterValue}
            info={info[qualifiedName as QualifiedParameterNameType]}
          />
        ))}
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
    return <PinValue value={value} />;
  }

  return (
    <span>
      {extractValue(value.engValue)?.toString().toLocaleUpperCase()}
      {info?.units}
    </span>
  );
}

function PinValue({ value }: { value: ParameterValue | undefined }) {
  if (typeof value?.engValue.stringValue !== "undefined") {
    return (
      <div
        data-state={value.engValue.booleanValue}
        className="data-[state=true]:bg-blue-700 bg-gray-300 dark:bg-gray-700 p-1 dark:text-white data-[state=true]:text-white min-w-[4.5rem] text-center"
      >
        {value.engValue.stringValue.toString().toLocaleUpperCase()}
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
