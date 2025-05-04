import { IDockviewPanelProps } from "dockview";
import { ChartCardParams } from "./schema";
import ScrollingChart from "./Chart";

export const ChartCard = (props: IDockviewPanelProps<ChartCardParams>) => {
  return (
    <div className="grid h-full place-items-center">
      <div className="flex h-full w-full flex-col">
        <div className="p-2">{props.params.title}</div>
        <ScrollingChart />
      </div>
    </div>
  );
};
