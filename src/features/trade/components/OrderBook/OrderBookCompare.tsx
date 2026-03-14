import React from "react";

import Visibility from "@/components/common/Visibility";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useShallowOrderBookStore } from "@/store/trade/orderbook";
import { cn } from "@/utils/cn";

const MAX_LEVELS = 10;

type Props = {
  hideLabels?: boolean;
  showOnSideLayout?: boolean;
  className?: string;
};

const OrderBookCompare = ({
  hideLabels,
  showOnSideLayout,
  className,
}: Props) => {
  const { bids, asks, showBuyAndSellRatio, layout } = useShallowOrderBookStore(
    (s) => ({
      bids: s.bids,
      asks: s.asks,
      showBuyAndSellRatio: s.settings.showBuyAndSellRatio,
      layout: s.layout,
    }),
  );

  if (!showBuyAndSellRatio) return <div className="lg:h-9" />;

  if (!showOnSideLayout && layout !== "orderBook") return null;

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
      <TooltipTrigger
        className={cn(
          "w-full flex items-center gap-x-1 px-4 py-2 text-3xs md:text-xs",
          className,
        )}
      >
        <Visibility visible={!hideLabels}>
          <div className="shrink-0 size-5 rounded text-buy border border-buy bg-buy/20 grid place-content-center">
            B
          </div>
        </Visibility>
        <p className={cn("lining-nums", { "text-buy": hideLabels })}>
          {bidPercentage.toFixed(2)}%
        </p>
        <div className="flex-1 flex gap-x-0.5">
          <div
            style={{ width: `${bidPercentage}%` }}
            className="h-1 md:h-2 w-full bg-buy rounded-l-full"
          />
          <div
            style={{ width: `${askPercentage}%` }}
            className="h-1 md:h-2 w-full bg-sell rounded-r-full"
          />
        </div>
        <p className={cn("lining-nums", { "text-sell": hideLabels })}>
          {askPercentage.toFixed(2)}%
        </p>
        <Visibility visible={!hideLabels}>
          <div className="shrink-0 size-5 rounded text-sell border border-sell bg-sell/20 grid place-content-center">
            S
          </div>
        </Visibility>
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
