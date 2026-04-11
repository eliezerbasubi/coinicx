import React from "react";

import {
  useOrderFormStore,
  useShallowOrderFormStore,
} from "@/lib/store/trade/order-form";
import { OrderSide } from "@/lib/types/trade";
import Visibility from "@/components/common/Visibility";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMarketEventContext } from "@/features/predict/lib/store/market-event/hooks";

import { VolumeStat } from "../MarketEventStats";
import MarketSideActions from "../MarketSideActions";
import PredictOrderTypes from "./PredictOrderTypes";

const PredictOrderFormHeader = () => {
  const { orderSide, sideIndex } = useShallowOrderFormStore((s) => ({
    sideIndex: s.predictSideIndex,
    orderSide: s.orderSide,
  }));

  const { marketEvent, marketEventType, marketEventSidesCtx } =
    useMarketEventContext((s) => {
      const marketEvent =
        s.marketEventMeta.outcomes[s.activeOutcomeIndex] ?? s.marketEventMeta;

      const sidesCtxs =
        s.marketEventCtx.outcomes[s.activeOutcomeIndex]?.sides ??
        s.marketEventCtx.sides;

      return {
        marketEvent,
        marketEventType: s.marketEventMeta.type,
        marketEventSidesCtx: sidesCtxs,
      };
    });

  const volume = marketEventSidesCtx[sideIndex]?.volume || 0;

  return (
    <React.Fragment>
      <Visibility visible={marketEventType === "categorical"}>
        <div className="px-4 pt-4">
          <p className="text-sm font-medium text-white">{marketEvent.title}</p>
          <VolumeStat value={volume} variant="compact" />
        </div>
      </Visibility>
      <Tabs
        defaultValue="buy"
        value={orderSide}
        onValueChange={(value) => {
          useOrderFormStore
            .getState()
            .onOrderSideChange(value as OrderSide, true);
        }}
      >
        <TabsList
          variant="line"
          className="w-full flex items-center justify-between px-4"
        >
          <TabsTrigger value="buy" className="flex-0 text-sm">
            Buy
          </TabsTrigger>
          <TabsTrigger value="sell" className="flex-0 text-sm">
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
        className="bg-neutral-gray-200 text-neutral-gray-400"
        wrapperClassName="grid grid-cols-2 gap-2 p-4"
        onClick={(sideIndex) =>
          useOrderFormStore.getState().setPredictSideIndex(sideIndex)
        }
      />
    </React.Fragment>
  );
};

export default PredictOrderFormHeader;
