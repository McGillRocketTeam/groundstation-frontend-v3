import { ComponentMap } from "./types";
import { DefaultCard } from "./default/DefaultCard";
import { CounterCard } from "./counter/CounterCard";
import { ChartCard } from "./chart/ChartCard";
import { CommandCard } from "./command/CommandCard";
import { ParameterTableCard } from "./parameterTable/ParameterTable";
import { ConnectedDevicesCard } from "./connectedDevices/ConnectedDevicesCard";
import { PacketHistoryCard } from "./packetHistory/PacketHistoryCard";
import { PIDCard } from "./pid/PIDCard";
import { withWrapper } from "./CardWrapper";

export * from "./types";
export * from "./schemas";

const internalComponents: ComponentMap = {
  default: DefaultCard,
  command: CommandCard,
  counter: CounterCard,
  chart: ChartCard,
  packetHistory: PacketHistoryCard,
  parameterTable: ParameterTableCard,
  pid: PIDCard,
  connectedDevices: ConnectedDevicesCard,
};

export const components = Object.fromEntries(
  Object.entries(internalComponents).map(([key, Comp]) => [
    key,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    withWrapper(Comp as any),
  ]),
);
