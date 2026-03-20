import React from "react";
import { Group, Line } from "react-konva";

import { DEPTH_CHART_COLORS, DEPTH_CHART_LAYOUT } from "../constants";
import { DepthChartData, DepthChartScale } from "../types";

type Props = {
  scale: DepthChartScale;
  data: DepthChartData;
};

const GridLines = ({ scale, data }: Props) => {
  const { plotArea } = scale;
  const { gridLineCount } = DEPTH_CHART_LAYOUT;
  const yMax = data.maxCumulative * 1.1;

  const horizontalLines: number[] = [];
  for (let i = 1; i <= gridLineCount; i++) {
    const value = (yMax / (gridLineCount + 1)) * i;
    horizontalLines.push(scale.yScale(value));
  }

  return (
    <Group listening={false}>
      {horizontalLines.map((y, i) => (
        <Line
          key={`h-${i}`}
          points={[plotArea.left, y, plotArea.right, y]}
          stroke={DEPTH_CHART_COLORS.gridLine}
          strokeWidth={0.5}
          listening={false}
        />
      ))}
    </Group>
  );
};

export default React.memo(GridLines);
