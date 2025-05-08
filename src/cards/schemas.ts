import { defaultSchema } from "./default/schema";
import { counterSchema } from "./counter/schema";
import { chartSchema } from "./chart/schema";
import { commandSchema } from "./command/schema";
import { parameterTableSchema } from "./parameterTable/schema";
import { connectedDevicesSchema } from "./connectedDevices/schema";
import { packetHistorySchema } from "./packetHistory/schema";
import { pidSchema } from "./pid/schema";

export const componentSchemas = {
  default: defaultSchema,
  command: commandSchema,
  counter: counterSchema,
  chart: chartSchema,
  packetHistory: packetHistorySchema,
  parameterTable: parameterTableSchema,
  pid: pidSchema,
  connectedDevices: connectedDevicesSchema,
} as const;
