import ScrollingChart from "./ScrollingChart";

export const ChartCard = () => {
  return (
    <div className="grid h-full place-items-center">
      <div className="flex h-full w-full flex-col">
        <ScrollingChart parameters={["/FC1/FlightComputer/battery_voltage"]} />
      </div>
    </div>
  );
};
