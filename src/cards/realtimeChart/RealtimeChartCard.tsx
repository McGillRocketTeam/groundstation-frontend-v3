import { IDockviewPanelProps } from "dockview-react";
import { RealtimeChartCardParams } from "./schema";
import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { yamcs } from "@/lib/yamcsClient/api";
import {
  NamedObjectId,
  SubscribeParametersData,
} from "@/lib/yamcsClient/lib/client";
import { extractNumberValue } from "@/lib/utils";

interface DataItem {
  name: string; // The time string (for tooltip)
  value: [number, number]; // [timestamp, actual_value]
}

// Type for the data structure to hold multiple series' data
// Keys will be the full parameter ID string (e.g., "/FC433/FlightComputer/packet_id")
type SeriesDataMap = Map<string, DataItem[]>;

const MAX_TIME_WINDOW_MS = 60 * 1000; // 60 seconds

export const RealtimeChartCard = ({
  params: config,
}: IDockviewPanelProps<RealtimeChartCardParams>) => {
  const chartInstance = useRef<echarts.ECharts | null>(null);
  // This ref will now store a Map where keys are parameter IDs and values are DataItem arrays
  const allSeriesData = useRef<SeriesDataMap>(new Map());
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const idMapping = useRef<{ [key: number]: NamedObjectId }>({});

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
      // Use the full parameter ID as the key for the map
      const paramId = seriesConfig.parameter;
      if (!allSeriesData.current.has(paramId)) {
        allSeriesData.current.set(paramId, []);
      }
    });

    const initialOption: echarts.EChartsOption = {
      legend: {
        orient: "horizontal",
        left: "10",
        bottom: "10",
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
      // Generate series configuration from config.series and provide initial empty data
      series: config.series.map((seriesConfig) => ({
        id: seriesConfig.parameter, // Use param ID as unique series ID for updates
        name: seriesConfig.name,
        type: "line",
        color: seriesConfig.color,
        // progressive: 5,
        // progressiveThreshold: 1,
        // progressiveChunkMode: "index",
        animation: false,
        large: true,
        showSymbol: false,
        data: allSeriesData.current.get(seriesConfig.parameter) || [], // Link to the ref's data
      })),
    };

    myChart.setOption(initialOption);

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length > 0) {
        myChart.resize();
      }
    });
    resizeObserver.observe(chartDom);

    // --- Data subscription and update logic for multiple series ---
    const listener = (incoming: SubscribeParametersData) => {
      if (incoming.mapping) {
        idMapping.current = {
          ...idMapping.current,
          ...incoming.mapping,
        };
      }
      if (!incoming.values || !myChart) return;

      const currentTimestamp = new Date().getTime();
      let shouldUpdateChart = false;

      // Process each received parameter value
      incoming.values.forEach((paramValue) => {
        const paramId = idMapping.current[paramValue.numericId].name; // Get the full parameter ID
        const seriesData = allSeriesData.current.get(paramId);

        if (seriesData) {
          // Check if this parameter corresponds to a configured series
          const number = extractNumberValue(paramValue.engValue);

          if (number !== null && number !== undefined) {
            seriesData.push({
              name: new Date(currentTimestamp).toString(),
              value: [currentTimestamp, number],
            });
            shouldUpdateChart = true;

            // Prune old points for this specific series
            while (
              seriesData.length > 0 &&
              currentTimestamp - seriesData[0].value[0] > MAX_TIME_WINDOW_MS
            ) {
              seriesData.shift();
            }
          } else {
            console.warn(
              `Could not extract valid number for ${paramId}.`,
              paramValue,
            );
          }
        } else {
          console.warn(`Received data for unconfigured parameter: ${paramId}`);
        }
      });

      // Only update ECharts if new data was actually processed
      if (shouldUpdateChart) {
        // Map the current state of allSeriesData back to ECharts series format
        const updatedSeriesOptions = config.series.map((seriesConfig) => ({
          // Use the 'id' property to allow ECharts to efficiently update by series
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
      }
    };

    const subscription = yamcs.createParameterSubscription(
      {
        id: config.series.map((series) => ({ name: series.parameter })), // Subscribe to all parameters defined in config.series
        instance: "gs_backend",
        processor: "realtime",
        abortOnInvalid: false,
        updateOnExpiration: false,
        sendFromCache: true,
        action: "REPLACE", // Or 'REPLACE_CHUNK', 'ACKNOWLEDGE_CHUNK' depending on needs
      },
      listener,
    );

    return () => {
      console.log("Cleaning up subscription and chart instance.");
      subscription.removeMessageListener(listener);
      resizeObserver.disconnect();
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [config.series]); // Add config.series to dependencies if it can change dynamically

  return (
    <div id="my_dataviz" className="w-full h-full">
      <div ref={chartContainerRef} id="main" className="w-full h-full"></div>
    </div>
  );
};
