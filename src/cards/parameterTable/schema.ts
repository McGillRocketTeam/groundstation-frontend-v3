import { QualifiedParameterName } from "@/lib/schemas";
import { z } from "zod";

export const parameterTableSchema = z
  .object({
    parameters: z.array(QualifiedParameterName),
  })
  .describe("Parameter Table");

export type ParameterTableCardParams = z.infer<typeof parameterTableSchema>;
