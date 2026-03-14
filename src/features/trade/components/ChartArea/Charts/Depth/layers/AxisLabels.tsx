import React from "react";
import { Group, Line, Text } from "react-konva";

import { formatPriceToDecimal } from "@/features/trade/utils";

import { DEPTH_CHART_COLORS, DEPTH_CHART_LAYOUT } from "../constants";
import { DepthChartData, DepthChartScale } from "../types";

type Props = {
  scale: DepthChartScale;
  data: DepthChartData;
  decimals: number | null;
};

const AxisLabels = ({ scale, data, decimals }: Props) => {
  const { plotArea } = scale;
  const {
    axisLabelFontSize,
    axisLabelFontFamily,
    xAxisTickCount,
    gridLineCount,
    axisTickLength,
  } = DEPTH_CHART_LAYOUT;
  const yMax = data.maxCumulative * 1.1;

  // X-axis price labels
  const priceRange = data.maxPrice - data.minPrice;
  const xTicks: Array<{ x: number; label: string }> = [];
  for (let i = 0; i <= xAxisTickCount; i++) {
    const price = data.minPrice + (priceRange / xAxisTickCount) * i;
    xTicks.push({
      x: scale.xScale(price),
      label: formatPriceToDecimal(price, decimals),
    });
  }

  // Y-axis cumulative labels (on the RIGHT side)
  const yTicks: Array<{ y: number; label: string }> = [];
  for (let i = 1; i <= gridLineCount; i++) {
    const value = (yMax / (gridLineCount + 1)) * i;
    yTicks.push({
      y: scale.yScale(value),
      label: formatPriceToDecimal(value, 2, { notation: "compact" }),
    });
  }

  return (
    <Group listening={false}>
      {/* X-axis tick marks and labels (bottom) */}
      {xTicks.map((tick, i) => (
        <React.Fragment key={`x-${i}`}>
          <Line
            points={[
              tick.x,
              plotArea.bottom,
              tick.x,
              plotArea.bottom + axisTickLength,
            ]}
            stroke={DEPTH_CHART_COLORS.axisText}
            strokeWidth={1}
            listening={false}
          />
          <Text
            x={tick.x - 20}
            y={plotArea.bottom + axisTickLength + 4}
            text={tick.label}
            fontSize={axisLabelFontSize}
            fontFamily={axisLabelFontFamily}
            fill={DEPTH_CHART_COLORS.axisText}
            align="center"
            width={40}
            listening={false}
          />
        </React.Fragment>
      ))}
      {/* Y-axis tick marks and labels (right side) */}
      {yTicks.map((tick, i) => (
        <React.Fragment key={`y-${i}`}>
          <Line
            points={[
              plotArea.right,
              tick.y,
              plotArea.right + axisTickLength,
              tick.y,
            ]}
            stroke={DEPTH_CHART_COLORS.axisText}
            strokeWidth={1}
            listening={false}
          />
          <Text
            x={plotArea.right + axisTickLength + 4}
            y={tick.y - 6}
            text={tick.label}
            fontSize={axisLabelFontSize}
            fontFamily={axisLabelFontFamily}
            fill={DEPTH_CHART_COLORS.axisText}
            listening={false}
          />
        </React.Fragment>
      ))}
      {/* X-axis baseline */}
      {/* <Line
        points={[plotArea.left, plotArea.bottom, plotArea.right, plotArea.bottom]}
        stroke={DEPTH_CHART_COLORS.gridLine}
        strokeWidth={1}
        listening={false}
      /> */}
      {/* Y-axis baseline (right) */}
      {/* <Line
        points={[plotArea.right, plotArea.top, plotArea.right, plotArea.bottom]}
        stroke={DEPTH_CHART_COLORS.gridLine}
        strokeWidth={1}
        listening={false}
      /> */}
    </Group>
  );
};

export default React.memo(AxisLabels);
