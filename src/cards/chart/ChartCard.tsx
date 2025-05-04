import { IDockviewPanelProps } from "dockview";
import { ChartCardParams } from "./schema";

export const ChartCard = (props: IDockviewPanelProps<ChartCardParams>) => {
  return (
    <div className="grid h-full place-items-center">
      <div>{props.params.title}</div>
      {/* Chart implementation */}
    </div>
  );
};
