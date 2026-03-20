"use client";

import React, { useEffect, useRef, useState } from "react";
import { Layer, Rect, Stage } from "react-konva";

import { useTradeContext } from "@/lib/store/trade/hooks";

import { DEPTH_CHART_COLORS, DEPTH_CHART_LAYOUT } from "./constants";
import { useContainerSize } from "./hooks/useContainerSize";
import { useDepthChartData } from "./hooks/useDepthChartData";
import { useDepthChartScale } from "./hooks/useDepthChartScale";
import { useDepthChartTooltip } from "./hooks/useDepthChartTooltip";
import AxisLabels from "./layers/AxisLabels";
import CrosshairLine from "./layers/CrosshairLine";
import DepthArea from "./layers/DepthArea";
import MidPriceDivider from "./layers/MidPriceDivider";
import Tooltip from "./layers/Tooltip";

const DepthChart = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useContainerSize(containerRef);
  const decimals = useTradeContext((s) => s.decimals);

  const [zoom, setZoom] = useState(0.5); // 50%

  const data = useDepthChartData(zoom);
  const scale = useDepthChartScale(data, { width, height });
  const { tooltip, onMouseMove, onMouseLeave } = useDepthChartTooltip(
    data,
    scale,
  );

  useEffect(() => {
    const controller = new AbortController();

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault(); // Prevents page scroll

      const { zoomMin, zoomMax, zoomStep } = DEPTH_CHART_LAYOUT;

      setZoom((prev) => {
        const delta = e.deltaY > 0 ? zoomStep : -zoomStep;
        return Math.min(zoomMax, Math.max(zoomMin, prev + delta));
      });
    };

    containerRef.current?.addEventListener("wheel", handleWheel, {
      passive: false,
      signal: controller.signal,
    });

    return () => {
      controller.abort();
    };
  }, []);

  if (!data || !scale || !width || !height) {
    return <div ref={containerRef} className="size-full" />;
  }

  return (
    <div ref={containerRef} className="size-full">
      <Stage
        width={width}
        height={height}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      >
        <Layer>
          <Rect
            width={width}
            height={height}
            fill={DEPTH_CHART_COLORS.background}
            listening={false}
          />
          <AxisLabels scale={scale} data={data} decimals={decimals} />
          <DepthArea bids={data.bids} asks={data.asks} scale={scale} />
          <MidPriceDivider midX={scale.midX} plotArea={scale.plotArea} />
          <CrosshairLine tooltip={tooltip} scale={scale} />
          <Tooltip
            tooltip={tooltip}
            decimals={decimals}
            plotArea={scale.plotArea}
          />
        </Layer>
      </Stage>
    </div>
  );
};

export default React.memo(DepthChart);
