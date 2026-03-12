import React from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useShallowOrderBookStore } from "@/store/trade/orderbook";

const MAX_LEVELS = 10;

const OrderBookCompare = () => {
  const showBuyAndSellRatio = useShallowOrderBookStore(
    (state) => state.settings.showBuyAndSellRatio,
  );

  if (!showBuyAndSellRatio) return <div className="lg:h-9" />;

  return <Compare />;
};

const Compare = () => {
  const { bids, asks } = useShallowOrderBookStore((state) => ({
    bids: state.bids,
    asks: state.asks,
  }));

  const bidVolume = bids
    .slice(0, MAX_LEVELS)
    .reduce((acc, level) => acc + Number(level.sz), 0);
  const askVolume = asks
    .slice(0, MAX_LEVELS)
    .reduce((acc, level) => acc + Number(level.sz), 0);

  const totalVolume = bidVolume + askVolume;

  const bidPercentage = totalVolume ? (bidVolume / totalVolume) * 100 : 0;
  const askPercentage = totalVolume ? (askVolume / totalVolume) * 100 : 0;

  return (
    <Tooltip>
      <TooltipTrigger className="w-full py-2">
        <div className="w-full flex items-center gap-x-1 px-4 text-xs">
          <div className="shrink-0 size-5 rounded text-buy border border-buy bg-buy/20 grid place-content-center">
            B
          </div>
          <p className="lining-nums">{bidPercentage.toFixed(2)}%</p>
          <div className="flex-1 flex gap-x-0.5">
            <div
              style={{ width: `${bidPercentage}%` }}
              className="h-2 w-full bg-buy rounded-l-full"
            />
            <div
              style={{ width: `${askPercentage}%` }}
              className="h-2 w-full bg-sell rounded-r-full"
            />
          </div>
          <p className="lining-nums">{askPercentage.toFixed(2)}%</p>
          <div className="shrink-0 size-5 rounded text-sell border border-sell bg-sell/20 grid place-content-center">
            S
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-80 text-xs font-medium text-wrap text-gray-300">
        <p>
          Track the contents of the first {MAX_LEVELS} data tranches of the Spot
          Order book and update the data in real time.
        </p>
      </TooltipContent>
    </Tooltip>
  );
};

export default React.memo(OrderBookCompare);
