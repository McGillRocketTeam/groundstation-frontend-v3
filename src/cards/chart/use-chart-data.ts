import { useState, useCallback, useEffect } from "react";
import { DataPoint } from "./types";
import { yamcs } from "@/lib/yamcsClient/api";
import { useParameterSubscription } from "@/hooks/use-parameter";
import { QualifiedParameterName } from "@/lib/schemas";
import { extractValue } from "@/lib/utils";

export function useChartData() {
  const [data, setData] = useState<DataPoint[]>([]);

  const addDataPoint = useCallback((newPoint?: DataPoint) => {
    const point = newPoint || {
      time: Date.now(),
      value: Math.random() * 100,
    };

    setData((currentData) => [...currentData, point]);
  }, []);

  // remove data points outside the visible window
  const pruneData = useCallback((windowSize: number) => {
    const cutoffTime = Date.now() - windowSize;
    setData((currentData) => {
      const firstVisibleIndex = currentData.findIndex(
        (point) => point.time >= cutoffTime,
      );

      if (firstVisibleIndex <= 0) return currentData;

      return currentData.slice(firstVisibleIndex - 1);
    });
  }, []);

  // === LIVE DATA ===
  const sampleParameter = QualifiedParameterName.parse(
    "/FC1/FlightComputer/battery_voltage",
  );

  // subscribe to updates
  const { values } = useParameterSubscription([sampleParameter]);
  useEffect(() => {
    const parameterValue = values[sampleParameter];
    if (parameterValue) {
      addDataPoint({
        time: Date.parse(parameterValue?.acquisitionTime),
        value: extractValue(parameterValue?.engValue) as number,
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  // initial data fetch
  useEffect(() => {
    const populateData = async () => {
      const newData = await yamcs.getParameterSamples(
        "gs_backend",
        "/FC1/FlightComputer/battery_voltage",
      );

      const dataPoints: DataPoint[] = newData.map((d) => ({
        time: Date.parse(d.time),
        value: d.avg,
      }));

      setData(dataPoints);
    };

    populateData();
  }, []);

  return { data, setData, pruneData };
}
