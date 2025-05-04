import { z } from "zod";

export const chartSchema = z
  .object({
    data: z.array(z.number()),
    title: z.string(),
  })
  .describe("Parameter Chart");

export type ChartCardParams = z.infer<typeof chartSchema>;
