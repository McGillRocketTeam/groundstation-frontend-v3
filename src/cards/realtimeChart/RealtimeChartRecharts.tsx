import { IDockviewPanelProps } from "dockview-react";
import { RealtimeChartCardParams } from "./schema";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";
import { useParameterSubscription } from "@/hooks/use-parameter";
import { QualifiedParameterNameType } from "@/lib/schemas";
import { extractNumberValue } from "@/lib/utils";

type ChartPoint = {
  timestamp: number;
} & {
  [parameter: string]: number;
};

export const RealtimeChartCard = ({
  params: config,
}: IDockviewPanelProps<RealtimeChartCardParams>) => {
  const [data, setData] = useState<Array<ChartPoint>>([]);

  const { values } = useParameterSubscription(
    config.series.map(
      (series) => series.parameter as QualifiedParameterNameType,
    ),
  );

  useEffect(() => {
    const newDataPoint: ChartPoint = {
      timestamp: new Date().getTime(),
    };
    Object.entries(values).forEach(([key, value]) => {
      if (!value) return;
      newDataPoint[key] = extractNumberValue(value?.engValue) as number;
    });

    setData((p) => {
      const updatedData = [...p, newDataPoint];
      // If the data array exceeds 100 points, slice it to keep only the last 100.
      if (updatedData.length > 50) {
        return updatedData.slice(-50);
      }
      return updatedData;
    });
  }, [values]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="timestamp" />
        <YAxis />
        <Tooltip />
        <Legend />
        {config.series.map((series) => (
          <Line
            key={series.parameter}
            type="monotone"
            dataKey={series.parameter}
            stroke={series.color}
            activeDot={{ r: 8 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};
