"use client";

import ReactECharts from "echarts-for-react";

type LineChartProps = {
  x: string[];
  series: { name: string; data: number[] }[];
  height?: number;
};

export function LineChart({ x, series, height = 320 }: LineChartProps) {
  const option = {
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(10, 14, 27, 0.94)",
      borderColor: "rgba(130, 149, 255, 0.35)",
      textStyle: { color: "#EAF0FF" },
      extraCssText: "box-shadow: 0 10px 28px rgba(0,0,0,0.35);",
    },
    legend: { textStyle: { color: "#9CA8C3" } },
    grid: { left: 16, right: 16, top: 40, bottom: 24, containLabel: true },
    xAxis: {
      type: "category",
      data: x,
      axisLabel: { color: "#9CA8C3" },
      axisLine: { lineStyle: { color: "rgba(125, 145, 205, 0.22)" } },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#9CA8C3" },
      splitLine: { lineStyle: { color: "rgba(125, 145, 205, 0.18)" } },
    },
    series: series.map((item, idx) => ({
      name: item.name,
      type: "line",
      smooth: true,
      data: item.data,
      lineStyle: { width: 2.6 },
      symbol: "circle",
      symbolSize: 6,
      showSymbol: false,
      emphasis: { focus: "series", showSymbol: true },
      color: idx % 2 === 0 ? "#34d399" : "#60a5fa",
      areaStyle: { opacity: 0.1 },
    })),
  };
  return <ReactECharts option={option} style={{ height }} />;
}
