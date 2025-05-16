import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { DataPoint, Margin } from "./types";
import { useResizeObserver } from "@/hooks/use-resize-observer";
import { useChartData } from "./use-chart-data";

function ScrollingChart({ parameters }: { parameters: string[] }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const { data, pruneData } = useChartData();
  const dimensions = useResizeObserver(wrapperRef);

  useEffect(() => {
    console.log(parameters);
    if (!dimensions || !svgRef.current) return;

    const margin: Margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const duration = 1000;
    const windowSize = 30000; // 30 seconds
    const { width, height } = dimensions;
    const chartWidth = Math.max(0, width - margin.left - margin.right);
    const chartHeight = Math.max(0, height - margin.top - margin.bottom);

    // Initialize the SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width} ${height}`);

    // Clear any existing content
    svg.selectAll("*").remove();

    // Skip rendering if dimensions are too small
    if (chartWidth <= 0 || chartHeight <= 0) return;

    // Create clip path
    svg
      .append("defs")
      .append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", chartWidth)
      .attr("height", chartHeight);

    // Create main group for the chart
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3
      .scaleTime()
      .domain([Date.now() - windowSize, Date.now()])
      .range([0, chartWidth]);

    const yRange = d3.extent(data.map((d) => d.value)) as [number, number];
    yRange[0] = yRange[0] * 1;
    yRange[1] = yRange[1] * 1.0;
    const yScale = d3.scaleLinear().domain(yRange).range([chartHeight, 0]);

    // Create line generator
    const line = d3
      .line<DataPoint>()
      .x((d) => xScale(d.time))
      .y((d) => yScale(d.value))
      .defined((d) => !isNaN(d.value));

    // Add axes
    const xAxis = g
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${chartHeight})`);

    // Y-axis
    const yTickSpacing = 50; // px per tick (adjust as needed)
    const yTickCount = Math.max(2, Math.floor(chartHeight / yTickSpacing));
    g.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(yScale).ticks(yTickCount));

    // Create group for the line with clip path
    const lineGroup = g.append("g").attr("clip-path", "url(#clip)");

    // Create path element
    const path = lineGroup
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "var(--mrt-red)")
      .attr("stroke-width", 1.5);

    let lastDataTime = Date.now();
    let frameId: number;

    // Animation function
    const animate = () => {
      const now = Date.now();
      const deltaTime = now - lastDataTime;

      if (deltaTime >= duration) {
        pruneData(windowSize);
        lastDataTime = now;
      }

      // Update scales continuously
      xScale.domain([now - windowSize, now]);

      // Update line
      path.datum(data).attr("d", line);

      // Update x-axis
      xAxis.call(d3.axisBottom(xScale));

      // Request next frame
      frameId = requestAnimationFrame(animate);
    };

    // Start the animation
    frameId = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [dimensions, data, pruneData]);

  return (
    <div ref={wrapperRef} className="grow">
      <div className="relative h-full w-full">
        <svg
          ref={svgRef}
          className="absolute top-0 left-0 h-full w-full"
          preserveAspectRatio="none"
        />
      </div>
    </div>
  );
}

export default ScrollingChart;
