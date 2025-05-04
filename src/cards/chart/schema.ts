import { z } from "zod";

export const chartSchema = z.object({
  data: z.array(z.number()),
  title: z.string(),
});

export type ChartCardParams = z.infer<typeof chartSchema>;
