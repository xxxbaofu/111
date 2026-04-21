"use client";

import ReactECharts from "echarts-for-react";

type LineChartProps = {
  x: string[];
  series: { name: string; data: number[] }[];
};

export function LineChart({ x, series }: LineChartProps) {
  const option = {
    tooltip: { trigger: "axis" },
    legend: { textStyle: { color: "#9CA8C3" } },
    grid: { left: 16, right: 16, top: 40, bottom: 24, containLabel: true },
    xAxis: {
      type: "category",
      data: x,
      axisLabel: { color: "#9CA8C3" },
      axisLine: { lineStyle: { color: "#1A2340" } },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#9CA8C3" },
      splitLine: { lineStyle: { color: "#1A2340" } },
    },
    series: series.map((item, idx) => ({
      name: item.name,
      type: "line",
      smooth: true,
      data: item.data,
      lineStyle: { width: 2 },
      color: idx % 2 === 0 ? "#22C55E" : "#3B82F6",
    })),
  };
  return <ReactECharts option={option} style={{ height: 320 }} />;
}
