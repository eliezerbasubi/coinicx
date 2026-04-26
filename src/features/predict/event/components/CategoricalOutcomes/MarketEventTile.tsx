import {
  useOrderFormStore,
  useShallowOrderFormStore,
} from "@/lib/store/trade/order-form";
import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import { useIsLaptop } from "@/hooks/useIsMobile";
import Visibility from "@/components/common/Visibility";
import { MarketSideActions } from "@/features/predict/components/MarketSideActions";
import { useMarketEventContext } from "@/features/predict/lib/store/market-event/hooks";
import { MarketEventMetaOutcome } from "@/features/predict/lib/types";

import OpenTradesTags from "../OpenTradesTags";

const defaultSide = {
  volume: 0,
  volumeInBase: 0,
  markPx: 0,
  midPx: 0,
  prevDayPx: 0,
  openInterest: 0,
};

const MarketEventTile = ({
  outcome,
  outcomeIndex,
  ...props
}: {
  outcome: MarketEventMetaOutcome;
  outcomeIndex: number;
} & React.ComponentProps<"div">) => {
  const {
    activeMarketOutcome,
    outcomesCtxs,
    setActiveOutcomeIndex,
    openTradingWidgetDrawer,
  } = useMarketEventContext((s) => ({
    activeMarketOutcome: s.marketEventMeta.outcomes[s.activeOutcomeIndex],
    outcomesCtxs: s.marketEventCtx.outcomes,
    setActiveOutcomeIndex: s.setActiveOutcomeIndex,
    openTradingWidgetDrawer: s.openTradingWidgetDrawer,
  }));

  const sideIndex = useShallowOrderFormStore((s) => s.predictSideIndex);

  const isLaptop = useIsLaptop();

  const sidesCtxs = outcomesCtxs?.[outcomeIndex]?.sides ?? [
    defaultSide,
    defaultSide,
  ];
  const primarySide = sidesCtxs[0];
  const midPx = primarySide.midPx ?? 0;
  const markPx = primarySide.markPx ?? 0;
  const prevDayPx = primarySide.prevDayPx ?? 0;

  const price = midPx || markPx;
  const change = markPx - prevDayPx;

  const changeInPercentage = change ? (change / prevDayPx) * 100 : 0;

  const openInterest = primarySide.openInterest;
  const volume = primarySide.volume;

  return (
    <div className="w-full p-3" {...props}>
      <div className="w-full grid grid-cols-1 md:flex items-center gap-2">
        <div className="flex-1">
          <p className="text-sm font-medium text-white text-left">
            {outcome.title}
          </p>

          <div className="flex items gap-2 divide-x divide-neutral-gray-200">
            <p className="text-xs font-medium text-neutral-gray-400 pr-2">
              <span>
                {formatNumber(volume, {
                  style: "currency",
                  notation: "compact",
                })}
              </span>
              <span className="ml-1">Vol</span>
            </p>
            <Visibility visible={!!openInterest}>
              <p className="text-xs font-medium text-neutral-gray-400 pr-2">
                <span>
                  {formatNumber(openInterest, {
                    style: "currency",
                    notation: "compact",
                  })}
                </span>
                <span className="ml-1">OI</span>
              </p>
            </Visibility>
          </div>
        </div>

        <div className="flex flex-col items-end md:grid grid-cols-2 md:items-center place-content-center md:gap-2">
          <p className="text-xl font-semibold text-white text-right">
            {formatNumber((price * 100) / 100, {
              style: "percent",
            })}
          </p>

          <Visibility
            visible={changeInPercentage !== 0 && changeInPercentage < 100}
          >
            <p
              className={cn("text-buy text-xs font-medium", {
                "text-sell": changeInPercentage < 0,
              })}
            >
              {formatNumber(changeInPercentage / 100, {
                style: "percent",
                useSign: true,
                maximumFractionDigits: 2,
              })}
            </p>
          </Visibility>
        </div>

        <MarketSideActions
          asChild
          sides={outcome.sides.map((side, index) => ({
            name: side.name,
            midPx: sidesCtxs[index]?.midPx,
            markPx: sidesCtxs[index]?.markPx || 1,
          }))}
          label="Buy"
          wrapperClassName="flex-1 grid grid-cols-2 col-span-2 md:flex items-center justify-end gap-2"
          className="w-full md:w-[136px]"
          currentSideIndex={
            activeMarketOutcome?.coin === outcome.coin ? sideIndex : undefined
          }
          onClick={(sideIndex, e) => {
            e?.stopPropagation();

            useOrderFormStore.getState().setPredictSideIndex(sideIndex);

            setActiveOutcomeIndex(outcomeIndex);

            // open trading widget drawer only on mobile
            if (!isLaptop) {
              openTradingWidgetDrawer(true, { resetOnMount: false });
            }
          }}
        />
      </div>

      <OpenTradesTags
        outcomeId={outcome.outcome}
        sides={outcome.sides}
        className="mt-2 md:mt-1"
        outcomeIndex={outcomeIndex}
      />
    </div>
  );
};

export default MarketEventTile;
