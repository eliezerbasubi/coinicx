import { ArrowLeft } from "lucide-react";

import { useOrderFormStore } from "@/lib/store/trade/order-form";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { MarketSideButton } from "@/features/predict/components/MarketSideActions";
import { useMarketEventContext } from "@/features/predict/lib/store/market-event/hooks";

import MarketRules from "./MarketRules";
import OrderbookAccordion from "./OrderbookAccordion";
import OutcomeGraph from "./OutcomeGraph";

type Props = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

/**
 * Drawer for showing details of a specific outcome in a market.
 *
 * It should only be visible when the market event type is categorical.
 */
const MarketEventOutcomeDrawer = ({ open, onOpenChange }: Props) => {
  const {
    marketEventCtx,
    activeOutcomeIndex,
    outcome,
    openTradingWidgetDrawer,
  } = useMarketEventContext((s) => ({
    activeOutcomeIndex: s.activeOutcomeIndex,
    outcome: s.marketEventMeta.outcomes[s.activeOutcomeIndex],
    marketEventCtx: s.marketEventCtx,
    openTradingWidgetDrawer: s.openTradingWidgetDrawer,
  }));

  const sidesCtxs = marketEventCtx.outcomes[activeOutcomeIndex]?.sides;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="w-full! border-l-0! px-0 standalone:pt-safe-top overflow-y-auto overflow-x-hidden">
        <DrawerHeader className="sticky top-0 z-10 bg-primary-dark gap-0 p-4">
          <DrawerTitle className="w-full flex items-center justify-center gap-2">
            <DrawerClose asChild>
              <ArrowLeft className="size-5" />
            </DrawerClose>
            <p className="flex-1 text-center text-base text-white font-semibold">
              {outcome.title}
            </p>
          </DrawerTitle>
          <DrawerDescription className="sr-only">
            Showing details of the currently selected outcome
          </DrawerDescription>
        </DrawerHeader>
        <div className="w-full space-y-2 px-4">
          <OutcomeGraph outcomeMeta={outcome} sidesCtxs={sidesCtxs ?? []} />

          <OrderbookAccordion />

          <MarketRules />
        </div>

        <div className="fixed bottom-4 inset-x-0 z-10 w-full mx-auto grid grid-cols-2 gap-2 px-4 md:px-6">
          {outcome.sides.map((side, index) => (
            <MarketSideButton
              key={side.coin}
              isCurrent
              side={{ ...side, ...sidesCtxs[index] }}
              index={index}
              label="Buy"
              className="h-11"
              onClick={() => {
                useOrderFormStore.getState().setPredictSideIndex(index);
                openTradingWidgetDrawer(true);
              }}
            />
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MarketEventOutcomeDrawer;
