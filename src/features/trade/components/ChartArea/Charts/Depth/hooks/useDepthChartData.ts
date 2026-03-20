import { useMemo } from "react";

import { useShallowOrderBookStore } from "@/lib/store/trade/orderbook";

import { DepthChartData, DepthPoint } from "../types";

const buildCumulativePoints = (
  levels: Array<{ px: string; sz: string }>,
): DepthPoint[] => {
  let cumulative = 0;
  return levels.map((level) => {
    const size = Number(level.sz);
    cumulative += size * Number(level.px);
    return { price: Number(level.px), size, cumulative };
  });
};

export const useDepthChartData = (zoom: number): DepthChartData | null => {
  const { bids, asks } = useShallowOrderBookStore((s) => ({
    bids: s.bids,
    asks: s.asks,
  }));

  return useMemo(() => {
    if (bids.length === 0 || asks.length === 0) return null;

    const allBids = buildCumulativePoints(bids);
    const allAsks = buildCumulativePoints(asks);

    // Use the same number of levels on both sides for visual balance.
    // zoom (0.1–1.0) controls how many levels are visible.
    const maxLevels = Math.min(allBids.length, allAsks.length);
    const visibleCount = Math.max(2, Math.round(maxLevels * zoom));

    const bidPoints = allBids.slice(0, visibleCount);
    const askPoints = allAsks.slice(0, visibleCount);

    const bestBid = bidPoints[0].price;
    const bestAsk = askPoints[0].price;
    const midPrice = (bestBid + bestAsk) / 2;

    const maxCumulative = Math.max(
      bidPoints[bidPoints.length - 1].cumulative,
      askPoints[askPoints.length - 1].cumulative,
    );

    // Symmetric range around mid-price
    const bidSpread = midPrice - bidPoints[bidPoints.length - 1].price;
    const askSpread = askPoints[askPoints.length - 1].price - midPrice;
    const maxSpread = Math.max(bidSpread, askSpread);

    return {
      bids: bidPoints,
      asks: askPoints,
      midPrice,
      maxCumulative,
      minPrice: midPrice - maxSpread,
      maxPrice: midPrice + maxSpread,
    };
  }, [bids, asks, zoom]);
};
