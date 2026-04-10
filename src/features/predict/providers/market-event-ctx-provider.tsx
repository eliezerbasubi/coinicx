import { useEffect } from "react";

import { useShallowInstrumentStore } from "@/lib/store/trade/instrument";

import { useMarketEventContext } from "../lib/store/market-event/hooks";
import { MarketEventMetaSide } from "../lib/types";
import { buildSideCoin } from "../lib/utils/outcomes";

// We separate context from meta to avoid unnecessary renders
const MarketEventCtxProvider = () => {
  const spotAssetCtxs = useShallowInstrumentStore((s) => s.spotAssetCtxs);
  const { marketEventMeta, setMarketEventCtx } = useMarketEventContext((s) => ({
    marketEventMeta: s.marketEventMeta,
    setMarketEventCtx: s.setMarketEventCtx,
  }));

  const buildSidesCtx = (sides: MarketEventMetaSide[]) => {
    return Array.from({ length: sides.length }).map((_, index) => {
      const ctx = spotAssetCtxs[sides[index].coin];

      return {
        volume: Number(ctx?.dayNtlVlm ?? 0),
        volumeInBase: Number(ctx?.dayBaseVlm ?? 0),
        markPx: Number(ctx?.markPx ?? 0),
        midPx: Number(ctx?.midPx ?? 0),
        prevDayPx: Number(ctx?.prevDayPx ?? 0),
        openInterest: Number(ctx?.circulatingSupply ?? 0),
      };
    });
  };

  useEffect(() => {
    // Handle non categorical outcomes. Questions don't have coins.
    if (marketEventMeta.coin) {
      const marketEventCtx = spotAssetCtxs[marketEventMeta.coin];

      if (marketEventCtx) {
        setMarketEventCtx({
          openInterest: Number(marketEventCtx.circulatingSupply),
          volume: Number(marketEventCtx.dayNtlVlm),
          outcomes: [],
          sides: buildSidesCtx(marketEventMeta.sides),
        });
      }
    } else {
      let openInterest = 0;
      let volume = 0;

      const outcomes = marketEventMeta.outcomes.map((outcome) => {
        const sides = buildSidesCtx(outcome.sides);
        openInterest += sides[0].openInterest + sides[1].openInterest;

        // We consider only one side for volume
        volume += sides[0].volume;
        return { sides };
      });

      setMarketEventCtx({
        openInterest,
        volume,
        outcomes,
        sides: [],
      });
    }
  }, [spotAssetCtxs, marketEventMeta]);

  return null;
};

export default MarketEventCtxProvider;
