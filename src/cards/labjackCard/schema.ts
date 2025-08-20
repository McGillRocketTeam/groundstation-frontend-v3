import { QualifiedParameterName } from "@/lib/schemas";
import { z } from "zod";
import { LocalParameterName } from "../parameterTable/schema";


// We need to maintain this because in prior
// versions the parameter could just be a qualified string
// but now we use the `LocalParameterName` object instead.
const LegacyParameterType = z
  .union([
    // Just a qualified parameter string
    QualifiedParameterName,
    // A user defined name and a qualfiied parameter string
    LocalParameterName,
  ])
  .describe("LocalParameter");

export type LegacyParameterType = z.infer<typeof LegacyParameterType>;

export const labjackTableSchema = z
  .object({
    view: z.enum(["list", "grid"]),
    parameters: z.array(LegacyParameterType),
  })
  .describe("LabJack Table");

export type LabjackTableCardParams = z.infer<typeof labjackTableSchema>;
