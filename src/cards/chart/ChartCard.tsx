import { IDockviewPanelProps } from "dockview-react";
import { ChartCardParams } from "./schema";
import { useDygraphs } from "./useDygraphs";
import { chartStore } from "@/stores/chart";
import { cn } from "../../lib/utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Lock, RotateCcw } from "lucide-react";

export const ChartCard = ({
  params: config,
  ...props
}: IDockviewPanelProps<ChartCardParams>) => {
  const triggerReset = chartStore((state) => state.triggerReset);
  const { containerRef, resetChart, legend } = useDygraphs(
    {}, // additional options to pass to dygraphs
    config.series,
    config.timeRange,
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="p-2 flex flex-col h-full items-start gap-2">
          {<div className="sr-only">{props.api.title}</div>}
          <div
            className={cn(
              "flex-grow min-h-0 w-full",
              !config.interactive && "pointer-events-none",
            )}
          >
            <div
              ref={containerRef}
              className="w-full h-full"
              style={{ width: props.api.width, height: props.api.height - 100 }}
            />
          </div>
          {config.showLegend && (
            <div className="flex flex-row flex-wrap gap-x-4 w-full text-sm pt-2">
              {config.series.map((series) => {
                const legendCorr = legend?.values.find(
                  (legend) => legend.name === series.name,
                );

                if (legendCorr === undefined) {
                  return;
                }

                return (
                  <div key={series.name}>
                    <span
                      className="font-semibold"
                      style={{ color: series.color }}
                    >
                      {series.name}
                    </span>{" "}
                    <span>
                      {typeof legendCorr.value === "number" &&
                        legendCorr.value.toLocaleString()}
                      {typeof legendCorr.value === "string" && legendCorr.value}
                      {typeof legendCorr.value === "undefined" && "UNKNOWN"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        <ContextMenuItem>
          {config.interactive ? "Lock interactivity" : "Unlock interactivity"}
          <ContextMenuShortcut>
            <Lock className="size-3" />
          </ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={() => resetChart()}>
          Reset this chart
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={triggerReset}>
          Reset all charts
          <ContextMenuShortcut>
            <RotateCcw className="size-3" />
          </ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
