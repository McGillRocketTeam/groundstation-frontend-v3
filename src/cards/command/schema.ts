import { z } from "zod";

export const commandSchema = z.object({}).describe("Command History");

export type CommandCardParams = z.infer<typeof commandSchema>;
