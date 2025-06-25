import { QualifiedCommandName } from "@/lib/schemas";
import { z } from "zod";

const commandButtonSchema = z.object({
  qualifiedName: QualifiedCommandName,
  label: z.string(),
  confirmationTime: z.number().optional(),
  arugments: z.record(z.string(), z.any()).optional(),
});

export const commandButtonTableSchema = z
  .object({ commands: z.array(commandButtonSchema) })
  .describe("Command Button Table");

export type CommandButtonTableCardParams = z.infer<
  typeof commandButtonTableSchema
>;
