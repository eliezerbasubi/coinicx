import React from "react";
import { Circle, Group, Line } from "react-konva";

import { DEPTH_CHART_COLORS, DEPTH_CHART_LAYOUT } from "../constants";
import { DepthChartScale, DualTooltipState } from "../types";

type Props = {
  tooltip: DualTooltipState;
  scale: DepthChartScale;
};

const CrosshairLine = ({ tooltip, scale }: Props) => {
  if (!tooltip.activeSide) return null;

  const { plotArea } = scale;
  const dash = DEPTH_CHART_LAYOUT.crosshairDash as unknown as number[];
  const { dotRadius } = DEPTH_CHART_LAYOUT;

  return (
    <Group listening={false}>
      {/* Bid side crosshair (left) */}
      {tooltip.bid.visible && (
        <>
          <Line
            points={[
              tooltip.bid.x,
              plotArea.top,
              tooltip.bid.x,
              plotArea.bottom,
            ]}
            stroke={DEPTH_CHART_COLORS.bidStroke}
            strokeWidth={0.5}
            dash={dash}
            listening={false}
          />
          <Line
            points={[
              plotArea.left,
              tooltip.bid.y,
              plotArea.right,
              tooltip.bid.y,
            ]}
            stroke={DEPTH_CHART_COLORS.bidStroke}
            strokeWidth={0.5}
            dash={dash}
            listening={false}
          />
          {/* Dot indicator on bid depth line */}
          <Circle
            x={tooltip.bid.x}
            y={tooltip.bid.y}
            radius={dotRadius}
            fill={DEPTH_CHART_COLORS.bidStroke}
            stroke={DEPTH_CHART_COLORS.background}
            strokeWidth={2}
            listening={false}
          />
        </>
      )}
      {/* Ask side crosshair (right) */}
      {tooltip.ask.visible && (
        <>
          <Line
            points={[
              tooltip.ask.x,
              plotArea.top,
              tooltip.ask.x,
              plotArea.bottom,
            ]}
            stroke={DEPTH_CHART_COLORS.askStroke}
            strokeWidth={0.5}
            dash={dash}
            listening={false}
          />
          <Line
            points={[
              plotArea.left,
              tooltip.ask.y,
              plotArea.right,
              tooltip.ask.y,
            ]}
            stroke={DEPTH_CHART_COLORS.askStroke}
            strokeWidth={0.5}
            dash={dash}
            listening={false}
          />
          {/* Dot indicator on ask depth line */}
          <Circle
            x={tooltip.ask.x}
            y={tooltip.ask.y}
            radius={dotRadius}
            fill={DEPTH_CHART_COLORS.askStroke}
            stroke={DEPTH_CHART_COLORS.background}
            strokeWidth={2}
            listening={false}
          />
        </>
      )}
    </Group>
  );
};

export default React.memo(CrosshairLine);
