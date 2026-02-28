import React from "react";
import { Group, Line } from "react-konva";

import { DEPTH_CHART_COLORS } from "../constants";
import { PlotArea } from "../types";

type Props = {
  midX: number;
  plotArea: PlotArea;
};

const MidPriceDivider = ({ midX, plotArea }: Props) => {
  return (
    <Group listening={false}>
      <Line
        points={[midX, plotArea.top, midX, plotArea.bottom]}
        stroke={DEPTH_CHART_COLORS.gridLine}
        strokeWidth={1.5}
        listening={false}
      />
    </Group>
  );
};

export default React.memo(MidPriceDivider);
