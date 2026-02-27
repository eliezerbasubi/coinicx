import { useCallback, useState } from "react";
import { KonvaEventObject } from "konva/lib/Node";

import {
  DepthChartData,
  DepthChartScale,
  DepthPoint,
  DualTooltipState,
  EMPTY_SIDE_TOOLTIP,
  SideTooltipInfo,
} from "../types";

const EMPTY_TOOLTIP: DualTooltipState = {
  bid: EMPTY_SIDE_TOOLTIP,
  ask: EMPTY_SIDE_TOOLTIP,
  activeSide: null,
};

const findBidLevel = (bids: DepthPoint[], price: number) => {
  // Bids sorted descending by price. Find the step covering this price.
  for (let i = 0; i < bids.length; i++) {
    if (bids[i].price <= price) {
      return { level: bids[i], index: i };
    }
  }
  return bids.length > 0
    ? { level: bids[bids.length - 1], index: bids.length - 1 }
    : null;
};

const findAskLevel = (asks: DepthPoint[], price: number) => {
  // Asks sorted ascending by price. Find the step covering this price.
  for (let i = 0; i < asks.length; i++) {
    if (asks[i].price >= price) {
      return { level: asks[i], index: i };
    }
  }
  return asks.length > 0
    ? { level: asks[asks.length - 1], index: asks.length - 1 }
    : null;
};

const buildSideTooltip = (
  side: "bid" | "ask",
  points: DepthPoint[],
  price: number,
  midPrice: number,
  scale: DepthChartScale,
): SideTooltipInfo => {
  const result =
    side === "bid" ? findBidLevel(points, price) : findAskLevel(points, price);

  if (!result) return EMPTY_SIDE_TOOLTIP;

  return {
    visible: true,
    x: scale.xScale(result.level.price),
    y: scale.yScale(result.level.cumulative),
    price: result.level.price,
    amount: result.level.size,
    cumulative: result.level.cumulative,
    midPrice,
  };
};

export const useDepthChartTooltip = (
  data: DepthChartData | null,
  scale: DepthChartScale | null,
) => {
  const [tooltip, setTooltip] = useState<DualTooltipState>(EMPTY_TOOLTIP);

  const onMouseMove = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (!data || !scale) return;

      const stage = e.target.getStage();
      const pos = stage?.getPointerPosition();
      if (!pos) return;

      const { plotArea, xInverse, midX } = scale;

      if (
        pos.x < plotArea.left ||
        pos.x > plotArea.right ||
        pos.y < plotArea.top ||
        pos.y > plotArea.bottom
      ) {
        setTooltip(EMPTY_TOOLTIP);
        return;
      }

      const cursorPrice = xInverse(pos.x);
      // Bids on LEFT (price < midPrice), asks on RIGHT (price >= midPrice)
      const activeSide: "bid" | "ask" =
        cursorPrice < data.midPrice ? "bid" : "ask";

      // Mirror price: symmetric around midPrice
      const mirrorPrice = 2 * data.midPrice - cursorPrice;

      const bidPrice = activeSide === "bid" ? cursorPrice : mirrorPrice;
      const askPrice = activeSide === "ask" ? cursorPrice : mirrorPrice;

      const bidInfo = buildSideTooltip(
        "bid",
        data.bids,
        bidPrice,
        data.midPrice,
        scale,
      );
      const askInfo = buildSideTooltip(
        "ask",
        data.asks,
        askPrice,
        data.midPrice,
        scale,
      );

      // Crosshair X: cursor on active side, mirrored on opposite
      const bidX = activeSide === "bid" ? pos.x : 2 * midX - pos.x;
      const askX = activeSide === "ask" ? pos.x : 2 * midX - pos.x;

      setTooltip({
        bid: {
          ...bidInfo,
          x: Math.max(plotArea.left, Math.min(midX, bidX)),
        },
        ask: {
          ...askInfo,
          x: Math.max(midX, Math.min(plotArea.right, askX)),
        },
        activeSide,
      });
    },
    [data, scale],
  );

  const onMouseLeave = useCallback(() => {
    setTooltip(EMPTY_TOOLTIP);
  }, []);

  return { tooltip, onMouseMove, onMouseLeave };
};
