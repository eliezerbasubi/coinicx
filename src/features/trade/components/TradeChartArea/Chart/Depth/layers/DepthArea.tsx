import React, { useMemo } from "react";
import { Group, Line } from "react-konva";

import { DEPTH_CHART_COLORS } from "../constants";
import { DepthChartScale, DepthPoint } from "../types";

type Props = {
  bids: DepthPoint[];
  asks: DepthPoint[];
  scale: DepthChartScale;
};

/** Full closed polygon for the fill (includes bottom + closing edges). */
const buildFillPoints = (
  points: DepthPoint[],
  scale: DepthChartScale,
  side: "bid" | "ask",
): number[] => {
  const { xScale, yScale, plotArea, midX } = scale;
  const coords: number[] = [];

  if (points.length === 0) return coords;

  if (side === "bid") {
    coords.push(midX, plotArea.bottom);
    coords.push(midX, yScale(points[0].cumulative));

    for (let i = 0; i < points.length; i++) {
      coords.push(xScale(points[i].price), yScale(points[i].cumulative));
      if (i < points.length - 1) {
        coords.push(xScale(points[i].price), yScale(points[i + 1].cumulative));
      }
    }

    const lastY = yScale(points[points.length - 1].cumulative);
    coords.push(plotArea.left, lastY);
    coords.push(plotArea.left, plotArea.bottom);
  } else {
    coords.push(midX, plotArea.bottom);
    coords.push(midX, yScale(points[0].cumulative));

    for (let i = 0; i < points.length; i++) {
      coords.push(xScale(points[i].price), yScale(points[i].cumulative));
      if (i < points.length - 1) {
        coords.push(xScale(points[i].price), yScale(points[i + 1].cumulative));
      }
    }

    const lastY = yScale(points[points.length - 1].cumulative);
    coords.push(plotArea.right, lastY);
    coords.push(plotArea.right, plotArea.bottom);
  }

  return coords;
};

/**
 * Open path for the visible staircase stroke only.
 * Excludes: bottom edge, right edge of bids (at midX), left edge of asks (at midX).
 */
const buildStrokePoints = (
  points: DepthPoint[],
  scale: DepthChartScale,
  side: "bid" | "ask",
): number[] => {
  const { xScale, yScale, plotArea } = scale;
  const coords: number[] = [];

  if (points.length === 0) return coords;

  // Start with horizontal cap from midX, then trace staircase steps outward.
  // Excludes: bottom edge, vertical closing edge at midX.
  const firstY = yScale(points[0].cumulative);

  // Horizontal cap from midX to first price (top of innermost step)
  coords.push(scale.midX, firstY);

  // Staircase steps
  for (let i = 0; i < points.length; i++) {
    coords.push(xScale(points[i].price), yScale(points[i].cumulative));
    if (i < points.length - 1) {
      coords.push(xScale(points[i].price), yScale(points[i + 1].cumulative));
    }
  }

  // Extend horizontally to the outer edge
  const lastY = yScale(points[points.length - 1].cumulative);
  coords.push(side === "bid" ? plotArea.left : plotArea.right, lastY);

  return coords;
};

const DepthArea = ({ bids, asks, scale }: Props) => {
  const bidFill = useMemo(
    () => buildFillPoints(bids, scale, "bid"),
    [bids, scale],
  );
  const askFill = useMemo(
    () => buildFillPoints(asks, scale, "ask"),
    [asks, scale],
  );
  const bidStroke = useMemo(
    () => buildStrokePoints(bids, scale, "bid"),
    [bids, scale],
  );
  const askStroke = useMemo(
    () => buildStrokePoints(asks, scale, "ask"),
    [asks, scale],
  );

  return (
    <Group listening={false}>
      {/* Fill only (no stroke) */}
      <Line
        points={bidFill}
        fill={DEPTH_CHART_COLORS.bidFill}
        closed
        listening={false}
      />
      <Line
        points={askFill}
        fill={DEPTH_CHART_COLORS.askFill}
        closed
        listening={false}
      />
      {/* Stroke only (open path, no fill) — visible staircase edges */}
      <Line
        points={bidStroke}
        stroke={DEPTH_CHART_COLORS.bidStroke}
        strokeWidth={1}
        listening={false}
      />
      <Line
        points={askStroke}
        stroke={DEPTH_CHART_COLORS.askStroke}
        strokeWidth={1}
        listening={false}
      />
    </Group>
  );
};

export default React.memo(DepthArea);
