import { IDockviewPanelProps } from "dockview-react";
import { RealtimeChartCardParams } from "./schema";
import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import {
  NamedObjectId,
  SubscribeParametersData,
} from "@/lib/yamcsClient/lib/client";
import { extractNumberValue } from "@/lib/utils";
import { yamcs } from "@/lib/yamcsClient/api";
interface DataItem {
  name: string; // The time string (for tooltip)
  value: [number, number]; // [timestamp, actual_value]
}
type SeriesDataMap = Map<string, DataItem[]>;
export const RealtimeChartCard = ({
  params: config,
}: IDockviewPanelProps<RealtimeChartCardParams>) => {
  const MAX_TIME_WINDOW_MS = config.timeRange * 1000; // 60 seconds
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const allSeriesData = useRef<SeriesDataMap>(new Map());
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const idMapping = useRef<{ [key: number]: NamedObjectId }>({});
  // Refs for throttling chart updates
  const animationFrameId = useRef<number | null>(null);
  const lastUpdateTime = useRef<number>(0);
  useEffect(() => {
    const chartDom = chartContainerRef.current;
    if (!chartDom) {
      console.error("ECharts container ref not found!");
      return;
    }
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartDom, null, {
        renderer: "canvas",
      });
    }
    const myChart = chartInstance.current;
    // Initialize allSeriesData map based on config.series
    config.series.forEach((seriesConfig) => {
      // Yamcs returns named IDs, so ensure this key matches what comes from idMapping
      const paramId = seriesConfig.parameter;
      if (!allSeriesData.current.has(paramId)) {
        allSeriesData.current.set(paramId, []);
      }
    });
    const initialOption: echarts.EChartsOption = {
      // tooltip: {
      //   trigger: "axis",
      //   formatter: function (params: any[]) {
      //     if (!params || params.length === 0) return "";
      //     const firstParam = params[0];
      //     const date = new Date(firstParam.value[0]);
      //     let tooltipHtml = `<strong>${date.toLocaleTimeString()}</strong><br/>`;
      //     params.forEach((param) => {
      //       tooltipHtml += `${param.marker} ${
      //         param.seriesName
      //       }: ${param.value[1].toFixed(2)}<br/>`;
      //     });
      //     return tooltipHtml;
      //   },
      //   axisPointer: {
      //     animation: false,
      //   },
      // },
      grid: {
        top: 20,
        left: 16,
        right: 16,
        bottom: 50,
        containLabel: true,
      },
      legend: {
        orient: "horizontal",
        left: "10",
        bottom: "10",
        formatter: (name: string) => {
          const series = allSeriesData.current.get(name);
          if (series && series.length > 0) {
            const lastPoint = series[series.length - 1];
            return `${name} (${lastPoint.value[1].toFixed(2)})`;
          }
          return name;
        },
      },
      xAxis: {
        type: "time",
        splitLine: {
          show: true,
        },
      },
      yAxis: {
        type: "value",
        splitLine: {
          show: true,
        },
      },
      series: config.series.map((seriesConfig) => ({
        id: seriesConfig.parameter, // Use param ID as unique series ID for updates
        name: seriesConfig.name,
        type: "line",
        color: seriesConfig.color,
        // Removed progressive/animation options for simplicity with data stream
        animation: false, // Ensure no intro animation
        large: true, // Optimizes rendering for large data sets
        largeThreshold: 50,
        showSymbol: false,
        data: allSeriesData.current.get(seriesConfig.parameter) || [],
      })),
    };
    myChart.setOption(initialOption);
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length > 0) {
        myChart.resize();
      }
    });
    resizeObserver.observe(chartDom);
    // Function to update the chart (throttled)
    const updateChart = () => {
      const currentTimestamp = new Date().getTime(); // Use current time for x-axis max
      const updatedSeriesOptions = config.series.map((seriesConfig) => ({
        id: seriesConfig.parameter,
        data: allSeriesData.current.get(seriesConfig.parameter) || [],
      }));
      myChart.setOption<echarts.EChartsOption>({
        series: updatedSeriesOptions,
        xAxis: {
          min: currentTimestamp - MAX_TIME_WINDOW_MS,
          max: currentTimestamp,
        },
      });
      animationFrameId.current = null; // Clear the animation frame ID
      lastUpdateTime.current = currentTimestamp; // Record when the chart was last updated
    };
    // --- Data subscription and processing logic ---
    const listener = (incoming: SubscribeParametersData) => {
      if (incoming.mapping) {
        idMapping.current = {
          ...idMapping.current,
          ...incoming.mapping,
        };
      }
      if (!incoming.values || !myChart) return;
      const currentTimestamp = new Date().getTime(); // Timestamp for incoming data points
      let dataAdded = false; // Flag to check if any data was actually added/updated
      incoming.values.forEach((paramValue) => {
        // Ensure the ID exists in mapping before trying to access
        if (!idMapping.current[paramValue.numericId]) {
          console.warn(
            `No name mapping found for numeric ID: ${paramValue.numericId}`,
          );
          return;
        }
        const paramName = idMapping.current[paramValue.numericId].name; // Get the full parameter name (string)
        const seriesData = allSeriesData.current.get(paramName);
        if (seriesData) {
          const number = extractNumberValue(paramValue.engValue);
          if (number !== null && number !== undefined) {
            seriesData.push({
              name: new Date(currentTimestamp).toString(),
              value: [currentTimestamp, number],
            });
            dataAdded = true; // Mark that data was added
            // Prune old points for this specific series
            while (
              seriesData.length > 0 &&
              currentTimestamp - seriesData[0].value[0] > MAX_TIME_WINDOW_MS
            ) {
              seriesData.shift();
            }
          } else {
            console.warn(
              `Could not extract valid number for ${paramName}.`,
              paramValue,
            );
          }
        } else {
          console.warn(
            `Received data for unconfigured parameter: ${paramName}`,
          );
        }
      });
      // --- Throttling ECharts update ---
      // Only schedule an update if new data arrived and an update isn’t already scheduled
      if (dataAdded && animationFrameId.current === null) {
        // Option 1: RequestAnimationFrame (smoother, ties to browser refresh)
        animationFrameId.current = requestAnimationFrame(updateChart);
        // Option 2: Fixed interval (less smooth, but guaranteed rate)
        // if (currentTimestamp - lastUpdateTime.current > CHART_UPDATE_INTERVAL_MS) {
        //   updateChart();
        // } else if (!animationFrameId.current) {
        //   // This part for ensuring a repaint even if rate is too high
        //   // requestAnimationFrame handles this better
        // }
      }
    };
    const subscription = yamcs.createParameterSubscription(
      {
        id: config.series.map((series) => ({ name: series.parameter })), // Subscribe to all parameters
        instance: "gs_backend",
        processor: "realtime",
        abortOnInvalid: false,
        updateOnExpiration: false,
        sendFromCache: true,
        action: "REPLACE",
      },
      listener,
    );
    return () => {
      console.log("Cleaning up subscription and chart instance.");
      subscription.removeMessageListener(listener);
      resizeObserver.disconnect();
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current); // Cancel any pending animation frame
      }
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [config.series]);
  return (
    <div id="my_dataviz" className="w-full h-full">
      <div ref={chartContainerRef} id="main" className="w-full h-full"></div>
    </div>
  );
};
