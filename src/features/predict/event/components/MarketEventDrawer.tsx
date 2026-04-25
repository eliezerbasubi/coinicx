import { useState } from "react";
import { ArrowLeft } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import Visibility from "@/components/common/Visibility";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { TradingWidgetDrawer } from "@/features/predict/components/TradingWidgetDrawer";
import { MarketEventMeta } from "@/features/predict/lib/types";
import MarketEventProvider from "@/features/predict/providers/market-event-provider";

import useHeaderVisibility from "../hooks/useHeaderVisibility";
import BottomNavActions from "./BottomNavActions";
import CategoricalOutcomes from "./CategoricalOutcomes";
import MarketEventChart from "./MarketEventChart";
import MarketEventHeader from "./MarketEventHeader";
import MarketEventOpenOrders from "./MarketEventOpenOrders";
import MarketEventPositions from "./MarketEventPositions";
import MarketRules from "./MarketRules";
import OrderbookAccordion from "./OrderbookAccordion";

type Props = {
  open?: boolean;
  slug: string;
  type: MarketEventMeta["type"];
  title: string;
  onOpenChange?: (open: boolean) => void;
};

/**
 * Drawer for showing details of a specific market event.
 */
const MarketEventDrawer = ({
  open,
  slug,
  type,
  title,
  onOpenChange,
}: Props) => {
  const [scrollContainer, setScrollContainer] = useState<HTMLDivElement | null>(
    null,
  );
  const { headerRef, isHeaderHidden } = useHeaderVisibility(scrollContainer);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="w-full border-l-0 p-0 standalone:pt-safe-top">
        {/* We wrap with MarketEventProvider to get access to the market event meta and context that are not present in the market event card */}
        <MarketEventProvider slug={slug}>
          <div
            ref={setScrollContainer}
            className="w-full overflow-y-auto overflow-x-hidden pb-12 no-scrollbars"
          >
            <DrawerHeader className="sticky top-0 z-10 bg-primary-dark gap-0 p-4">
              <DrawerTitle className="w-full flex items-center justify-center gap-2">
                <DrawerClose asChild>
                  <ArrowLeft className="size-5" />
                </DrawerClose>
                <p
                  className={cn(
                    "flex-1 text-left text-sm text-white font-medium",
                    "transition-all duration-200 ease-out overflow-hidden",
                    isHeaderHidden
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-full",
                  )}
                >
                  {title}
                </p>
              </DrawerTitle>
              <DrawerDescription className="sr-only">
                Showing details of the currently selected prediction market
                event
              </DrawerDescription>
            </DrawerHeader>
            <div className="w-full px-4">
              <MarketEventHeader
                titleRef={headerRef}
                className="pt-0 pb-4 lg:py-4"
              />

              <MarketEventChart />

              {/* Categorical outcomes */}
              <CategoricalOutcomes />

              {/* Orderbook */}
              <Visibility visible={type !== "categorical"}>
                <MarketEventPositions className="mt-4" />
                <MarketEventOpenOrders className="mt-4" />
                <OrderbookAccordion />
              </Visibility>

              {/* Market Rules */}
              <MarketRules />
            </div>

            <Visibility visible={type !== "categorical"}>
              <BottomNavActions />
            </Visibility>
          </div>
          <TradingWidgetDrawer />
        </MarketEventProvider>
      </DrawerContent>
    </Drawer>
  );
};

export default MarketEventDrawer;
