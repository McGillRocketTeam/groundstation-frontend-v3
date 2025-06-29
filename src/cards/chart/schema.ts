import { z } from "zod";

export const chartSchema = z.object({}).describe("Parameter Chart");

export type ChartCardParams = z.infer<typeof chartSchema>;
