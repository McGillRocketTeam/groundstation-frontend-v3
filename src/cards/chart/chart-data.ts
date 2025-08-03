import { z } from "zod";

const baseChartSeriesSchema = z.object({
  yamcsPropertyType: z.literal("CHART"),
  parameter: z.string(),
  name: z.string(),
  color: z.string(),
});

// Define the first variation that extends the base schema
const seriesNumberSchema = baseChartSeriesSchema.extend({
  type: z.literal("number"),
});

const seriesBooleanSchema = baseChartSeriesSchema.extend({
  type: z.literal("boolean"),
});

// Define the second variation that extends the base schema
const seriesEnumSchema = baseChartSeriesSchema.extend({
  type: z.literal("enumeration"),
  enumeration: z.record(z.string()),
});

export const chartSeriesSchema = z
  .union([seriesNumberSchema, seriesBooleanSchema, seriesEnumSchema])
  .describe("ChartSeries");

export type ChartSeries = z.infer<typeof chartSeriesSchema>;
