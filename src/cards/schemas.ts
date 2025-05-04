import { defaultSchema } from "./default/schema";
import { counterSchema } from "./counter/schema";
import { chartSchema } from "./chart/schema";
import { commandSchema } from "./command/schema";

export const componentSchemas = {
  default: defaultSchema,
  command: commandSchema,
  counter: counterSchema,
  chart: chartSchema,
} as const;
