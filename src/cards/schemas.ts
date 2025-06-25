import { chartSchema } from "./chart/schema";
import { commandSchema } from "./command/schema";
import { parameterTableSchema } from "./parameterTable/schema";
import { connectedDevicesSchema } from "./connectedDevices/schema";
import { packetHistorySchema } from "./packetHistory/schema";
import { pidSchema } from "./pid/schema";
import { booleanTableSchema } from "./booleanTable/schema";
import { serialTerminalSchema } from "./serialTerminal/schema";
import { commandButtonTableSchema } from "./commandButtonTable/schema";
import { commandButtonSchema } from "./commandButton/schema";

export const componentSchemas = {
  booleanTable: booleanTableSchema,
  command: commandSchema,
  commandButton: commandButtonSchema,
  commandButtonTable: commandButtonTableSchema,
  chart: chartSchema,
  packetHistory: packetHistorySchema,
  parameterTable: parameterTableSchema,
  pid: pidSchema,
  connectedDevices: connectedDevicesSchema,
  serialTerminal: serialTerminalSchema,
} as const;
