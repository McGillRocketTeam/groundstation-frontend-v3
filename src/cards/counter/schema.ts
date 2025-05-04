import { z } from "zod";

export const counterSchema = z
  .object({
    initialCount: z.number(),
    label: z.string(),
  })
  .describe("Counter");

export type CounterCardParams = z.infer<typeof counterSchema>;
