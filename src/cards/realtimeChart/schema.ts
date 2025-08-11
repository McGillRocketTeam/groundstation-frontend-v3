import { z } from "zod";
import { chartSeriesSchema } from "../chart/chart-data";

export const realtimeChartSchema = z
  .object({
    interactive: z
      .boolean()
      .default(true)
      .describe("Allow panning and zooming on the chart."),
    showLegend: z
      .boolean()
      .default(true)
      .describe(
        "Show the legend on the chart with the last value of each series.",
      ),
    timeRange: z
      .number()
      .min(1)
      .describe(
        "The amount of historical time to show on the chart in seconds.",
      )
      .default(180),
    series: z.array(chartSeriesSchema).min(1),
  })
  .describe("Realtime Chart");

export type RealtimeChartCardParams = z.infer<typeof realtimeChartSchema>;
