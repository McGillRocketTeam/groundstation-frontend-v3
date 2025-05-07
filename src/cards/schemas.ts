import { defaultSchema } from "./default/schema";
import { counterSchema } from "./counter/schema";
import { chartSchema } from "./chart/schema";
import { commandSchema } from "./command/schema";
import { parameterTableSchema } from "./parameterTable/schema";
import { packetSchema } from "./packet/schema";
import { connectedDevicesSchema } from "./connectedDevices/schema";

export const componentSchemas = {
  default: defaultSchema,
  command: commandSchema,
  counter: counterSchema,
  chart: chartSchema,
  packet: packetSchema,
  parameterTable: parameterTableSchema,
  connectedDevices: connectedDevicesSchema,
} as const;
