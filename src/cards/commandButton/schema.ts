import { QualifiedParameterName } from "@/lib/schemas";
import { z } from "zod";

export const commandConfigurationSchema = z
  .object({
    qualifiedName: QualifiedParameterName,
    label: z.string(),
    confirmationTime: z.number().optional(),
    arguments: z.record(z.string(), z.any()).optional(),
  })
  .describe("CommandConfiguration");

export const commandButtonSchema = z
  .object({
    command: commandConfigurationSchema,
  })
  .describe("Command Button");

export type CommandConfiguration = z.infer<typeof commandConfigurationSchema>;
export type CommandButtonCardParams = z.infer<typeof commandButtonSchema>;
