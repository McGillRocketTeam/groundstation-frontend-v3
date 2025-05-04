import { defaultSchema } from "./default/schema";
import { counterSchema } from "./counter/schema";
import { chartSchema } from "./chart/schema";

export const componentSchemas = {
  default: defaultSchema,
  counter: counterSchema,
  chart: chartSchema,
} as const;
