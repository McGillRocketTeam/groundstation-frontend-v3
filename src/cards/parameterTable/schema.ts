import { QualifiedParameterName } from "@/lib/schemas";
import { z } from "zod";

export const LocalParameterName = z.object({
  friendlyName: z.string(),
  qualifiedName: QualifiedParameterName
})

export type LocalParameterName = z.infer<typeof LocalParameterName>

// We need to maintain this because in prior
// versions the parameter could just be a qualified string
// but now we use the `LocalParameterName` object instead.
const LegacyParameterType = z.union([
  // Just a qualified parameter string
  QualifiedParameterName, 
  // A user defined name and a qualfiied parameter string
  LocalParameterName
]).describe("LocalParameter")

export type LegacyParameterType = z.infer<typeof LegacyParameterType>

export const parameterTableSchema = z
  .object({
    view: z.enum(["list", "grid"]),
    parameters: z.array(LegacyParameterType)
  })
  .describe("Parameter Table");

export type ParameterTableCardParams = z.infer<typeof parameterTableSchema>;
