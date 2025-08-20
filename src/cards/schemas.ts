import { chartSchema } from "./chart/schema";
import { commandSchema } from "./command/schema";
import { parameterTableSchema } from "./parameterTable/schema";
import { connectedDevicesSchema } from "./connectedDevices/schema";
import { packetHistorySchema } from "./packetHistory/schema";
import { pidSchema } from "./pid/schema";
import { booleanTableSchema } from "./booleanTable/schema";
import { serialTerminalSchema } from "./serialTerminal/schema";
import { commandButtonTableSchema } from "./commandButtonTable/schema";
import { mapSchema } from "./map/schema";
import { realtimeChartSchema } from "./realtimeChart/schema";
import { labjackTableSchema } from "./labjackCard/schema";

export const componentSchemas = {
  booleanTable: booleanTableSchema,
  command: commandSchema,
  commandButtonTable: commandButtonTableSchema,
  chart: chartSchema,
  realtimeChart: realtimeChartSchema,
  map: mapSchema,
  packetHistory: packetHistorySchema,
  parameterTable: parameterTableSchema,
  pid: pidSchema,
  connectedDevices: connectedDevicesSchema,
  serialTerminal: serialTerminalSchema,
  labjackTable: labjackTableSchema
} as const;
