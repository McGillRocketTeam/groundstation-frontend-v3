import { z } from "zod";

export const defaultSchema = z.object({
  custom: z.string(),
});

export type DefaultCardParams = z.infer<typeof defaultSchema>;
