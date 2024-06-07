import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const TimeSeriesChart = ({
  width = 500,
  height = 400,
  data = [],
  onZoomEnd,
}) => {
  const chartRef = useRef(null);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);

  useEffect(() => {
    if (data.length >= 0) {
      const svg = d3.select(chartRef.current);
      const margin = { top: 20, right: 20, bottom: 30, left: 50 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      svg.selectAll("*").remove();

      const xScale = d3
        .scaleTime()
        .domain(d3.extent(data, (d) => new Date(d.date)))
        .range([0, innerWidth]);

      const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);

      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.value)])
        .nice()
        .range([innerHeight, 0]);

      const yAxis = d3.axisLeft(yScale);

      const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .attr("class", "x-axis")
        .call(xAxis);

      g.append("g").attr("class", "y-axis").call(yAxis);

      const line = d3
        .line()
        .x((d) => xScale(new Date(d.date)))
        .y((d) => yScale(d.value))
        .curve(d3.curveMonotoneX);

      svg
        .append("defs")
        .append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", innerWidth)
        .attr("height", innerHeight);

      g.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", line)
        .attr("clip-path", "url(#clip)");

      // Zoom and Pan functionality
      const zoom = d3
        .zoom()
        .scaleExtent([0, 5])
        .translateExtent([
          [0, 0],
          [width - margin.right, height - margin.top],
        ])
        .extent([
          [0, 0],
          [innerWidth, innerHeight],
        ])
        .on(
          "zoom",

          (event) => {
            const newXScale = event.transform.rescaleX(xScale);
            const newYScale = event.transform.rescaleY(yScale);

            g.select(".x-axis").call(xAxis.scale(newXScale));
            g.select(".y-axis").call(yAxis.scale(newYScale));

            g.selectAll(".line").attr(
              "d",
              line
                .x((d) => newXScale(new Date(d.date)))
                .y((d) => newYScale(d.value))
            );

            // Adding logic to fetch more data at the end of the graph
            const [xMin, xMax] = newXScale.domain();
            const [dataMin, dataMax] = d3.extent(data, (d) => new Date(d.date));

            if (xMin <= dataMin) {
              setHasReachedEnd("left"); // if zoom reaches the start
            } else if (xMax >= dataMax) {
              setHasReachedEnd("right"); // if zoom reaches the end
            } else {
              setHasReachedEnd(false); // Set state to false if zoom is not at the start or end
            }
          }
        );

      svg.call(zoom);
    }
  }, [data, width, height]);

  useEffect(() => {
    if (hasReachedEnd && onZoomEnd) {
      onZoomEnd(hasReachedEnd);
    }
  }, [hasReachedEnd, onZoomEnd]);

  if (data.length === 0) {
    return (
      <div>
        <p>Loading.......</p>
      </div>
    );
  }

  return <svg ref={chartRef} width={width} height={height}></svg>;
};

export default TimeSeriesChart;
