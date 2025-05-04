import { z } from "zod";

export const defaultSchema = z
  .object({
    custom: z.string(),
  })
  .describe("Default");

export type DefaultCardParams = z.infer<typeof defaultSchema>;
