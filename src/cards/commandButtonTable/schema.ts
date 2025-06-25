import { z } from "zod";
import { commandConfigurationSchema } from "../commandButton/schema";

export const commandButtonTableSchema = z
  .object({ commands: z.array(commandConfigurationSchema) })
  .describe("Command Button Table");

export type CommandButtonTableCardParams = z.infer<
  typeof commandButtonTableSchema
>;
