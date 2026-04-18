import React from "react";

import {
  useOrderFormStore,
  useShallowOrderFormStore,
} from "@/lib/store/trade/order-form";
import { OrderSide } from "@/lib/types/trade";
import { cn } from "@/lib/utils/cn";
import Visibility from "@/components/common/Visibility";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMarketEventContext } from "@/features/predict/lib/store/market-event/hooks";

import { VolumeStat } from "../MarketEventStats";
import { MarketSideActions } from "../MarketSideActions";
import PredictOrderTypes from "./TradingWidgetOrderTypes";

type Props = {
  sideClassName?: string;
  tabsClassName?: string;
  showEventTitle?: boolean;
};

const TradingWidgetHeader = ({
  sideClassName,
  tabsClassName,
  showEventTitle = true,
}: Props) => {
  const { orderSide, sideIndex } = useShallowOrderFormStore((s) => ({
    sideIndex: s.predictSideIndex,
    orderSide: s.orderSide,
  }));

  const { marketEvent, marketEventSidesCtx } = useMarketEventContext((s) => {
    const marketEvent =
      s.marketEventMeta.outcomes[s.activeOutcomeIndex] ?? s.marketEventMeta;

    const sidesCtxs =
      s.marketEventCtx.outcomes[s.activeOutcomeIndex]?.sides ??
      s.marketEventCtx.sides;

    return {
      marketEvent,
      marketEventSidesCtx: sidesCtxs,
    };
  });

  const volume = marketEventSidesCtx[sideIndex]?.volume || 0;

  return (
    <React.Fragment>
      <Visibility visible={showEventTitle}>
        <div className="px-4 pt-4">
          <p className="text-sm font-medium text-white">{marketEvent.title}</p>
          <VolumeStat value={volume} variant="compact" />
        </div>
      </Visibility>
      <Tabs
        defaultValue="buy"
        value={orderSide}
        className="h-8 md:h-11"
        onValueChange={(value) => {
          useOrderFormStore.getState().onOrderSideChange({
            orderSide: value as OrderSide,
            isSpot: true,
          });
        }}
      >
        <TabsList
          variant="line"
          className={cn(
            "w-full flex items-center justify-between px-4 pt-0 md:pt-[3px]",
            tabsClassName,
          )}
        >
          <TabsTrigger value="buy" className="flex-0 text-xs md:text-sm">
            Buy
          </TabsTrigger>
          <TabsTrigger value="sell" className="flex-0 text-xs md:text-sm">
            Sell
          </TabsTrigger>

          <PredictOrderTypes />
        </TabsList>
      </Tabs>

      <MarketSideActions
        sides={marketEvent.sides.map((side, index) => ({
          ...side,
          ...marketEventSidesCtx[index],
        }))}
        currentSideIndex={sideIndex}
        className={cn(
          "bg-neutral-gray-200 text-neutral-gray-400",
          sideClassName,
        )}
        wrapperClassName="grid grid-cols-2 gap-2 p-2 md:p-4"
        onClick={(sideIndex) =>
          useOrderFormStore.getState().setPredictSideIndex(sideIndex)
        }
      />
    </React.Fragment>
  );
};

export default TradingWidgetHeader;
