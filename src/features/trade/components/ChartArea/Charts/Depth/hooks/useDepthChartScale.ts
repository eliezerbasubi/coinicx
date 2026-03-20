import { useMemo } from "react";

import { DEPTH_CHART_LAYOUT } from "../constants";
import { DepthChartData, DepthChartScale } from "../types";

export const useDepthChartScale = (
  data: DepthChartData | null,
  dimensions: { width: number; height: number },
): DepthChartScale | null => {
  const { width, height } = dimensions;

  return useMemo(() => {
    if (!data || width === 0 || height === 0) return null;

    const { paddingTop, paddingBottom, paddingLeft, paddingRight } =
      DEPTH_CHART_LAYOUT;

    const plotArea = {
      left: paddingLeft,
      right: width - paddingRight,
      top: paddingTop,
      bottom: height - paddingBottom,
      width: width - paddingLeft - paddingRight,
      height: height - paddingTop - paddingBottom,
    };

    const priceRange = data.maxPrice - data.minPrice;
    const yMax = data.maxCumulative * 1.1;

    // Bids on LEFT (low prices), asks on RIGHT (high prices)
    const xScale = (price: number) => {
      if (priceRange === 0) return plotArea.left + plotArea.width / 2;
      return (
        plotArea.left +
        ((price - data.minPrice) / priceRange) * plotArea.width
      );
    };

    // Standard: 0 at bottom, max at top
    const yScale = (cumulative: number) => {
      if (yMax === 0) return plotArea.bottom;
      return plotArea.bottom - (cumulative / yMax) * plotArea.height;
    };

    const xInverse = (pixelX: number) => {
      if (plotArea.width === 0) return data.midPrice;
      return (
        data.minPrice +
        ((pixelX - plotArea.left) / plotArea.width) * priceRange
      );
    };

    const midX = xScale(data.midPrice);

    return { xScale, yScale, xInverse, plotArea, midX };
  }, [data, width, height]);
};
