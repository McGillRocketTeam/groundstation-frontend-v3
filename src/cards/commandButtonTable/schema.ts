import { z } from "zod";

export const commandButtonTableSchema = z
  .object({})
  .describe("Command Button Table");

export type CommandButtonTableCardParams = z.infer<
  typeof commandButtonTableSchema
>;
