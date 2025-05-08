import { IDockviewPanelProps } from "dockview";
import { ChartCardParams } from "./schema";
import ScrollingChart from "./ScrollingChart";

export const ChartCard = (props: IDockviewPanelProps<ChartCardParams>) => {
  return (
    <div className="grid h-full place-items-center">
      <div className="flex h-full w-full flex-col">
        <ScrollingChart parameters={["/FC1/FlightComputer/battery_voltage"]} />
      </div>
    </div>
  );
};
