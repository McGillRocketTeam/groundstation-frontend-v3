import { ComponentMap } from "./types";
import { ChartCard } from "./chart/ChartCard";
import { CommandCard } from "./command/CommandCard";
import { ParameterTableCard } from "./parameterTable/ParameterTable";
import { ConnectedDevicesCard } from "./connectedDevices/ConnectedDevicesCard";
import { PacketHistoryCard } from "./packetHistory/PacketHistoryCard";
import { PIDCard } from "./pid/PIDCard";
import { withWrapper } from "./CardWrapper";
import { BooleanTableCard } from "./booleanTable/BooleanTableCard";
import { SerialTerminalCard } from "./serialTerminal/SerialTerminal";
import { CommandButtonTableCard } from "./commandButtonTable/CommandButtonTable";

export * from "./types";
export * from "./schemas";

const internalComponents: ComponentMap = {
  booleanTable: BooleanTableCard,
  command: CommandCard,
  commandButtonTable: CommandButtonTableCard,
  chart: ChartCard,
  packetHistory: PacketHistoryCard,
  parameterTable: ParameterTableCard,
  pid: PIDCard,
  connectedDevices: ConnectedDevicesCard,
  serialTerminal: SerialTerminalCard,
};

export const components = Object.fromEntries(
  Object.entries(internalComponents).map(([key, Comp]) => [
    key,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    withWrapper(Comp as any),
  ]),
);
