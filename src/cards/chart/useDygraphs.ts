/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useEffect, useState } from "react";
import Dygraph, { dygraphs } from "dygraphs";
import { ChartSeries } from "./chart-data";
import { yamcs } from "@/lib/yamcsClient/api";
import {
  NamedObjectId,
  ParameterSubscription,
  ParameterValue,
  Sample,
  SubscribeParametersData,
} from "@/lib/yamcsClient/lib/client";
import { CustomBarsValue, DySample, DySeries } from "./dygraphs";
import { extractNumberValue } from "@/lib/utils";
import { chartStore } from "@/stores/chart";

const YAMCS_INSTANCE = "gs_backend";

interface Legend {
  date: Date;
  values: { name: string; value: number | boolean | string | undefined }[];
}

export function useDygraphs(
  options: dygraphs.Options = {},
  series: ChartSeries[],
  timeRange: number,
) {
  const resetSignal = chartStore((state) => state.resetSignal);

  const chartRef = useRef<Dygraph | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [disableDataReload, setDisalbeDatReload] = useState(false);
  const [loading, setLoading] = useState(false);

  // If true, load more samples than needed
  // (useful when horizontal scroll is allowed)
  const [extendRequestedRange] = useState(true);

  // How many samples to load at once
  const [resolution, setResolution] = useState(6000);

  const [minValue, setMinValue] = useState<number | undefined>(undefined);
  const [maxValue, setMaxValue] = useState<number | undefined>(undefined);

  const [visibleStart, setVisibleStart] = useState<Date | undefined>(undefined);
  const [visibleStop, setVisibleStop] = useState<Date | undefined>(undefined);
  const [legend, setLegend] = useState<Legend | undefined>();

  let lastLoadPromise: Promise<any> | null;

  const chartData = useRef<DySample[]>([]);
  const idMapping = useRef<{ [key: number]: NamedObjectId }>({});
  //const subscription = useRef<ParameterSubscription | null>(null);
  const realtimeView = useRef<boolean>(true);

  // const debouncedProcessRealtimeDelivery = debounce(
  //   processRealtimeDelivery,
  //   10,
  // );

  /**
   *  Adjusts x by zoomInPercentage
   */
  function zoom(zoomInPercentage: number, xBias = 0.5) {
    const chart = chartRef.current;
    if (!chart) return;

    chart.updateOptions({
      dateWindow: adjustAxis(chart.xAxisRange(), zoomInPercentage, xBias) as [
        number,
        number,
      ],
    });

    const xAxisRange = chart.xAxisRange();
    const start = new Date(xAxisRange[0]);
    const stop = new Date(xAxisRange[1]);
    updateWindow(start, stop);
    // this.onManualRangeChange.emit();
  }

  function resetChart(start?: Date, stop?: Date) {
    realtimeView.current = true;
    start = start || new Date(new Date().getTime() - timeRange * 1000);
    stop = stop || new Date();
    updateWindow(start, stop, true);
  }

  function adjustAxis(axis: any, zoomInPercentage: number, bias: number) {
    const delta = axis[1] - axis[0];
    const increment = delta * zoomInPercentage;
    const foo = [increment * bias, increment * (1 - bias)];
    return [axis[0] + foo[0], axis[1] - foo[1]];
  }

  // Take the offset of a mouse event on the dygraph canvas and
  // convert it to a pair of percentages from the bottom left.
  function offsetToPercentage(offsetX: number) {
    const chart = chartRef.current;
    if (!chart) return;
    // Calculate pixel offset of the leftmost date.
    const xOffset = chart.toDomCoords(chart.xAxisRange()[0], null)[0];

    // x y w and h are relative to the corner of the drawing area,
    // so that the upper corner of the drawing area is (0, 0).
    const x = offsetX - xOffset;

    // Calculate the rightmost pixel, effectively defining the width
    const w = chart.toDomCoords(chart.xAxisRange()[1], null)[0] - xOffset;

    // Percentage from the left.
    return w === 0 ? 0 : x / w;
  }

  async function updateWindow(start: Date, stop: Date, force = false) {
    if (isNaN(start.getTime()) || isNaN(stop.getTime())) {
      console.error("Invalid start or stop date:", start, stop);
      return;
    }

    setLoading(true);

    const delta = extendRequestedRange ? stop.getTime() - start.getTime() : 0;
    const loadStart = new Date(start.getTime() - delta);
    const loadStop = new Date(stop.getTime() + delta);

    const promises: Promise<any>[] = [];
    for (const parameter of series) {
      promises.push(
        yamcs.getParameterSamples(YAMCS_INSTANCE, parameter.parameter, {
          start: loadStart.toISOString(),
          stop: loadStop.toISOString(),
          count: resolution,
          fields: ["time", "n", "avg", "min", "max"],
          gapTime: 300000,
          useRawValue: parameter.type === "enumeration",
        }),
      );
    }

    try {
      const loadPromise = Promise.all(promises);
      lastLoadPromise = loadPromise;
      const results = await loadPromise;

      if (lastLoadPromise === loadPromise) {
        setLoading(false);
        setVisibleStart(start);
        setVisibleStop(stop);

        const dySeries: DySample[][] = [];
        for (let i = 0; i < results.length; i++) {
          if (results[i] && Array.isArray(results[i])) {
            dySeries[i] = processSamples(results[i]);
          } else {
            console.error(
              "Invalid samples received for parameter:",
              series[i].parameter,
            );
          }
        }

        const dySamples = mergeSeries(...dySeries);
        chartData.current = dySamples.length ? dySamples : [];
        const dyOptions: { [key: string]: any } = {
          file: dySamples.length ? dySamples : "X\n",
        };

        if (force) {
          dyOptions.dateWindow = [start.getTime(), stop.getTime()];
        }

        chartRef.current?.updateOptions(dyOptions);
        lastLoadPromise = null;
      }
    } catch (error) {
      console.error("Error in updateWindow:", error);
      setLoading(false);
    }
  }

  /**
   * Updates the legend with the last data point
   */
  function updateLegend(index: number = chartData.current.length - 1) {
    const sample = chartData.current[index];
    setLegend({
      date: sample[0],
      values: sample.slice(1).map((v, i) => {
        const seriesValue = series[i];
        const value =
          seriesValue.type === "enumeration"
            ? seriesValue.enumeration[
                (v as CustomBarsValue)?.at(1)?.toString() ?? "0"
              ] //+
            : // " " +
              // JSON.stringify(v as CustomBarsValue)
              (v as CustomBarsValue)?.at(1);
        return {
          name: seriesValue.name,
          value,
        };
      }),
    });
  }

  /**
   * Converts an array of `Sample` from the YAMCS API into an array of `DySample` which can be fed into Dygraphs.
   */
  function processSamples(samples: Sample[]) {
    const dySamples: DySample[] = [];
    for (const sample of samples) {
      const t = new Date();
      t.setTime(Date.parse(sample["time"]));
      if (sample.n > 0) {
        const v = sample["avg"];
        const min = sample["min"];
        const max = sample["max"];

        if (minValue === undefined) {
          setMinValue(min);
          setMaxValue(max);
        } else {
          if (minValue > min) {
            setMinValue(min);
          }
          if (maxValue! < max) {
            setMaxValue(max);
          }
        }
        dySamples.push([t, [min, v, max]]);
      } else {
        dySamples.push([t, null]);
      }
    }
    return dySamples;
  }

  /**
   * Merges two or more DySample[] series together. This assumes that timestamps between
   * the two series are identical, which is the case if server requests are done
   * with the same date range.
   */
  function mergeSeries(...series: DySeries[]) {
    if (series.length === 1) {
      return series[0];
    }
    let result: DySample[] = series[0];
    for (let i = 1; i < series.length; i++) {
      const merged: DySample[] = [];
      let index1 = 0;
      let index2 = 0;
      let prev1: CustomBarsValue[] = [];
      let prev2: CustomBarsValue | null = null;
      const series1 = result;
      const series2 = series[i];
      while (index1 < series1.length || index2 < series2.length) {
        const top1 = index1 < series1.length ? series1[index1] : null;
        const top2 = index2 < series2.length ? series2[index2] : null;
        if (top1 && top2) {
          if (top1[0].getTime() === top2[0].getTime()) {
            prev1 = top1.slice(1) as CustomBarsValue[];
            prev2 = top2[1];
            merged.push([top1[0], ...prev1, prev2] as any);
            index1++;
            index2++;
          } else if (top1[0].getTime() < top2[0].getTime()) {
            prev1 = top1.slice(1) as CustomBarsValue[];
            merged.push([top1[0], ...prev1, prev2] as any);
            index1++;
          } else {
            prev2 = top2[1];
            merged.push([top2[0], ...prev1, prev2] as any);
            index2++;
          }
        } else if (top1) {
          prev1 = top1.slice(1) as CustomBarsValue[];
          merged.push([top1[0], ...prev1, prev2] as any);
          index1++;
        } else if (top2) {
          prev2 = top2[1];
          merged.push([top2[0], ...prev1, prev2] as any);
          index2++;
        }
      }
      result = merged;
    }
    return result;
  }

  // Draw the chart for the first time
  useEffect(() => {
    updateWindow(new Date(new Date().getTime() - timeRange * 1000), new Date());
    if (containerRef.current && !chartRef.current) {
      chartRef.current = new Dygraph(containerRef.current, "X\n", {
        ...options,
        labels: ["Date", ...series.map((s) => s.name)],
        colors: [...series.map((s) => s.color)],
        strokeWidth: 1.5,
        customBars: true,
        legend: "never",
        highlightCircleSize: 3,
        highlightCallback: (_event, _xVal, points) => {
          updateLegend(points[0].idx);
        },
        unhighlightCallback: () => updateLegend(),
        interactionModel: {
          mousedown: (event: any, g: Dygraph, context: any) => {
            realtimeView.current = false;
            context.initializeMouseDown(event, g, context);
            if (event.altKey || event.shiftKey) {
              (Dygraph as any).startZoom(event, g, context);
            } else {
              (Dygraph as any).startPan(event, g, context);
            }
          },
          mousemove: (event: any, g: Dygraph, context: any) => {
            if (context.isPanning) {
              setDisalbeDatReload(true);
              (Dygraph as any).movePan(event, g, context);
            } else if (context.isZooming) {
              setDisalbeDatReload(true);
              (Dygraph as any).moveZoom(event, g, context);
            }
          },
          mouseup: (event: any, g: Dygraph, context: any) => {
            if (context.isPanning) {
              (Dygraph as any).endPan(event, g, context);
            } else if (context.isZooming) {
              (Dygraph as any).endZoom(event, g, context);
            }

            const xAxisRange = g.xAxisRange();
            const start = new Date(xAxisRange[0]);
            const stop = new Date(xAxisRange[1]);

            // const yAxisRange = g.yAxisRanges()[0];
            updateWindow(start, stop);
            // this.onManualRangeChange.emit();

            setDisalbeDatReload(false);
          },
          click: (event: any) => {
            // lastClickedGraph = g;
            event.preventDefault();
            event.stopPropagation();
          },
          dblclick: (_: MouseEvent, g: Dygraph) => {
            const xAxisRange = g.xAxisRange();
            const delta = xAxisRange[1] - xAxisRange[0];
            const now = new Date();

            resetChart(new Date(now.getTime() - delta), now);
          },
          mouseout: (g: Dygraph, context: any) => {
            if (context.isPanning) {
              const xAxisRange = g.xAxisRange();
              const start = new Date(xAxisRange[0]);
              const stop = new Date(xAxisRange[1]);

              updateWindow(start, stop);
            }
            setDisalbeDatReload(false);
          },
          mousewheel: (event: any) => {
            // if (lastClickedGraph !== g) {
            //   return;
            // }
            realtimeView.current = false;
            const normal = event.detail ? event.detail * -1 : event.deltaY / 40;
            // For me the normalized value shows 0.075 for one click. If I took
            // that verbatim, it would be a 7.5%.
            const percentage = normal / 50;

            if (!(event.offsetX && event.offsetY)) {
              event.offsetX = event.layerX - event.target.offsetLeft;
              event.offsetY = event.layerY - event.target.offsetTop;
            }

            const xPct = offsetToPercentage(event.offsetX);
            zoom(percentage, xPct);
            event.preventDefault();
            event.stopPropagation();
          },
        },
      });
    }

    const listener = (data: SubscribeParametersData) => {
      if (data.mapping) {
        idMapping.current = {
          ...idMapping.current,
          ...data.mapping,
        };
      }

      if (disableDataReload) return;

      if (!data.values || !Array.isArray(data.values)) {
        console.error("Invalid data.values:", data.values);
        return;
      }

      try {
        processRealtimeDelivery(data.values);
        // debouncedProcessRealtimeDelivery(data.values);
      } catch (error) {
        console.error("Error in processRealtimeDelivery:", error);
      }
    };

    let subscriptionInstance: ParameterSubscription | null = null;

    try {
      subscriptionInstance = yamcs.createParameterSubscription(
        {
          instance: YAMCS_INSTANCE,
          processor: "realtime",
          id: series.map((s) => ({ name: s.parameter })),
          abortOnInvalid: false,
          updateOnExpiration: true,
          sendFromCache: true,
          action: "REPLACE",
        },
        listener,
      );
    } catch (error) {
      console.error("Failed to create YAMCS subscription:", error);
    }

    // Cleanup subscription on unmount
    return () => {
      if (subscriptionInstance) {
        subscriptionInstance.removeMessageListener(listener);
        console.log("YAMCS subscription cleaned up.");
      }
    };
  }, [series, disableDataReload]);

  const prevSeriesRef = useRef(series);

  // Update the labels if the series changes
  // ie a new line is added or removed
  useEffect(() => {
    if (chartRef.current) {
      //if a series is being removed
      if (prevSeriesRef.current.length > series.length) {
        let i = 0;
        //determine index of deleted series
        for (
          ;
          i < series.length && series[i].name === prevSeriesRef.current[i].name;
          ++i
        );

        //delete all data related to deleted series (+1 for date)
        chartData.current.forEach((data) => {
          data.splice(i + 1, 1);
        });
      }

      chartRef.current.updateOptions({
        labels: ["Date", ...series.map((s) => s.name)],
        colors: [...series.map((s) => s.color)],
        file: chartData.current,
      });
      prevSeriesRef.current = series;
    }
  }, [series]);

  // keep track of the size and update the chart to fit the container
  useEffect(() => {
    const updateSize = () => {
      console.log("UPDATE SIZE");
      if (containerRef.current) {
        chartRef?.current?.resize();
      }
    };

    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current) {
      console.log("UPDATE SIZE SETUP");
      resizeObserver.observe(containerRef.current);
    }

    // Initial size update
    updateSize();

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  // Reset the chart when the reset signal changes
  // this is so that all charts can be reset at once
  useEffect(() => {
    if (resetSignal) {
      resetChart(
        new Date(resetSignal.getTime() - timeRange * 1000),
        resetSignal,
      );
    }
  }, [resetSignal]);

  function processRealtimeDelivery(pvals: ParameterValue[]) {
    if (!Array.isArray(pvals) || pvals.length === 0) {
      console.error("Invalid or empty pvals:", pvals);
      return;
    }

    const latestRealtimeValues = new Map<string, CustomBarsValue>();

    for (const pval of pvals) {
      let dyValue: CustomBarsValue = null;

      let value = extractNumberValue(pval.engValue);

      // Only use the raw value if the parameter is an enum
      if (pval.engValue.type === "ENUMERATED") {
        value = pval.rawValue.uint32Value!;
      }

      if (pval.acquisitionTime) {
        if (value !== null && value !== undefined) {
          if (pval.acquisitionStatus === "EXPIRED") {
            dyValue = null; // Display as gap
          } else if (pval.acquisitionStatus === "ACQUIRED") {
            dyValue = [value, value, value];
          }
        }
      }

      const id = idMapping.current[pval.numericId];
      if (id) {
        latestRealtimeValues.set(id.name, dyValue);
      } else {
        console.warn("No mapping found for numericId:", pval.numericId);
      }
    }

    const t = new Date(pvals[0].generationTime);
    const chart = chartRef.current;

    const dyValues: CustomBarsValue[] = series.map((s) => {
      return latestRealtimeValues.get(s.parameter) || null;
    });

    // Add realtime value to chart
    if (chart) {
      const sample: any = [t, ...dyValues];
      chartData.current.shift();
      chartData.current.push(sample);
      const chartOptions: dygraphs.Options = {
        file: chartData.current,
      };
      updateLegend();

      if (realtimeView.current) {
        chartOptions.dateWindow = [
          chartData.current[0][0].getTime(),
          t.getTime(),
        ];
      }

      chart.updateOptions(chartOptions);
      // Set the selection to the most recent value
      chart.setSelection(chartData.current.length - 1);
    }
  }

  return {
    containerRef,
    loading,
    visibleStart,
    visibleStop,
    setResolution,
    resetChart,
    legend,
  };
}
