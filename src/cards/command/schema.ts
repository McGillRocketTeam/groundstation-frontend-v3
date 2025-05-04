import { z } from "zod";

export const commandSchema = z.object({});

export type CommandCardParams = z.infer<typeof commandSchema>;
