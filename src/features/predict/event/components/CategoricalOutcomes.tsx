import {
  useOrderFormStore,
  useShallowOrderFormStore,
} from "@/lib/store/trade/order-form";
import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import Visibility from "@/components/common/Visibility";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useMarketEventContext } from "@/features/predict/store/market-event/hooks";

import { MarketEventMetaOutcome } from "../../types";
import MarketSideActions from "./MarketSideActions";

const CategoricalOutcomes = () => {
  const { marketEventMeta, setActiveOutcomeIndex } = useMarketEventContext(
    (s) => ({
      marketEventMeta: s.marketEventMeta,
      setActiveOutcomeIndex: s.setActiveOutcomeIndex,
    }),
  );

  return (
    <Accordion type="single" collapsible className="w-full mt-4 space-y-1">
      {marketEventMeta.outcomes.map((outcome, index) => {
        return (
          <AccordionItem
            key={outcome.coin}
            value={outcome.coin}
            className="not-last:border-0"
          >
            <AccordionTrigger
              hideArrow
              onClick={() => setActiveOutcomeIndex(index)}
              className="border-0 hover:no-underline py-0"
            >
              <MarketEventAccordionTrigger
                outcome={outcome}
                outcomeIndex={index}
              />
            </AccordionTrigger>
            <AccordionContent>
              Yes. It adheres to the WAI-ARIA design pattern.
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};

const defaultSide = {
  volume: 0,
  volumeInBase: 0,
  markPx: 0,
  midPx: 0,
  prevDayPx: 0,
  openInterest: 0,
};

const MarketEventAccordionTrigger = ({
  outcome,
  outcomeIndex,
  ...props
}: {
  outcome: MarketEventMetaOutcome;
  outcomeIndex: number;
} & React.ComponentProps<"div">) => {
  const { activeMarketOutcome, outcomesCtxs, setActiveOutcomeIndex } =
    useMarketEventContext((s) => ({
      activeMarketOutcome: s.marketEventMeta.outcomes[s.activeOutcomeIndex],
      outcomesCtxs: s.marketEventCtx.outcomes,
      setActiveOutcomeIndex: s.setActiveOutcomeIndex,
    }));
  const sideIndex = useShallowOrderFormStore((s) => s.predictSideIndex);

  const sidesContexts = outcomesCtxs?.[outcomeIndex]?.sides ?? [
    defaultSide,
    defaultSide,
  ];
  const primarySide = sidesContexts[0];
  const midPx = primarySide.midPx ?? 0;
  const markPx = primarySide.markPx ?? 0;
  const prevDayPx = primarySide.prevDayPx ?? 0;

  const price = midPx || markPx;
  const change = markPx - prevDayPx;

  const changeInPercentage = change ? (change / prevDayPx) * 100 : 0;

  const openInterest = primarySide.openInterest;
  const volume = primarySide.volume;

  return (
    <div
      className="w-full flex items-center gap-2 bg-neutral-gray-600 rounded-md p-3"
      {...props}
    >
      <div className="flex-1">
        <p className="text-sm font-medium text-white">{outcome.title}</p>

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
        asChild
        sides={outcome.sides.map((side, index) => ({
          ...side,
          ...sidesContexts[index],
        }))}
        label="Buy"
        wrapperClassName="flex-1 flex items-center justify-end gap-2"
        className="w-[136px]"
        currentSideIndex={
          activeMarketOutcome?.coin === outcome.coin ? sideIndex : undefined
        }
        onClick={(sideIndex, e) => {
          e?.stopPropagation();

          useOrderFormStore.getState().setPredictSideIndex(sideIndex);
          setActiveOutcomeIndex(outcomeIndex);
        }}
      />
    </div>
  );
};

export default CategoricalOutcomes;
