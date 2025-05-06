import { IDockviewPanelProps } from "dockview-react";
import { ParameterTableCardParams } from "./schema";
import { useParameterSubscription } from "@/hooks/use-parameter";
import { extractValue } from "@/lib/utils";

export const ParameterTableCard = ({
  params,
}: IDockviewPanelProps<ParameterTableCardParams>) => {
  const { values, info } = useParameterSubscription(params.parameters);

  return (
    <div>
      {params.parameters.map((parameter) => (
        <div
          className="hover:bg-muted grid grid-cols-[1fr_auto] place-items-center gap-2 border-b p-2"
          key={parameter}
        >
          <div className="grid h-full w-full items-center truncate">
            <div className="overflow-hidden text-sm text-ellipsis whitespace-nowrap">
              {parameter}
            </div>
          </div>
          <div className="w-full text-right whitespace-nowrap">
            {values[parameter] ? (
              <>
                {values[parameter].engValue.type === "ENUMERATED" ? (
                  <span>
                    {info[parameter]?.enumValues
                      ?.find(
                        (v) =>
                          v.value ===
                          extractValue(values[parameter]!.rawValue)?.toString(),
                      )
                      ?.label.toLocaleUpperCase() ??
                      `UNDEF ${extractValue(values[parameter].rawValue)}`}
                  </span>
                ) : (
                  <span>
                    {extractValue(values[parameter].engValue)
                      ?.toString()
                      .toLocaleUpperCase()}
                    {info[parameter]?.units}
                  </span>
                )}
              </>
            ) : (
              <span className="text-muted-foreground">UNAVAILABLE</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
