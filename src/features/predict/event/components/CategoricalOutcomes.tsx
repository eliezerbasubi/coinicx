import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import Visibility from "@/components/common/Visibility";
import { useMarketEventContext } from "@/features/predict/store/market-event/hooks";

import MarketSideActions from "./MarketSideActions";

const CategoricalOutcomes = () => {
  const { marketEvent, setActiveMarketOutcome } = useMarketEventContext(
    (s) => ({
      marketEvent: s.marketEvent,
      setActiveMarketOutcome: s.setActiveMarketOutcome,
    }),
  );

  return (
    <div className="w-full mt-4 space-y-1">
      {marketEvent.outcomes.map((outcome) => {
        const primarySide = outcome.sides[0];
        const price = primarySide.midPx || primarySide.markPx;
        const change = primarySide.markPx - primarySide.prevDayPx;

        const changeInPercentage = change
          ? (change / primarySide.prevDayPx) * 100
          : 0;

        const openInterest =
          outcome.sides[0].openInterest + outcome.sides[1].openInterest;

        return (
          <div
            key={outcome.coin}
            className="w-full flex items-center gap-2 bg-neutral-gray-600 rounded-md p-3"
            onClick={() => {
              setActiveMarketOutcome(outcome);
            }}
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{outcome.title}</p>

              <div className="flex items gap-2 divide-x divide-neutral-gray-200">
                <p className="text-xs font-medium text-neutral-gray-400 pr-2">
                  <span>
                    {formatNumber(primarySide.volume, {
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

            <div className="grid grid-cols-2 items-center place-content-center gap-2">
              <p className="text-xl font-semibold text-white text-right">
                {formatNumber((price * 100) / 100, {
                  style: "percent",
                })}
              </p>

              <Visibility visible={changeInPercentage < 100}>
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
              sides={outcome.sides}
              label="Buy"
              wrapperClassName="flex-1 flex items-center justify-end gap-2"
              className="w-[136px]"
              onClick={(sideIndex) => {
                // TODO: set the current side index to the orderform store
                console.log("🚨 - CategoricalOutcomes.tsx - 71", sideIndex);

                setActiveMarketOutcome(outcome);
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default CategoricalOutcomes;
