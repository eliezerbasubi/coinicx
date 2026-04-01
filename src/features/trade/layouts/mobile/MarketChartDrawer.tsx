import { Fragment, useState } from "react";
import { AlignHorizontalDistributeCenter, ArrowLeft } from "lucide-react";
import { useWebHaptics } from "web-haptics/react";

import { useTradeContext } from "@/lib/store/trade/hooks";
import { useOrderFormStore } from "@/lib/store/trade/order-form";
import { OrderSide } from "@/lib/types/trade";
import { cn } from "@/lib/utils/cn";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import AssetsSelector from "@/features/trade/components/AssetsSelector";
import FavoriteButton from "@/features/trade/components/FavoriteButton";
import MarketArea from "@/features/trade/components/MarketArea";
import TickerContexts from "@/features/trade/components/TickerOverview/TickerContexts";
import TickerPrice from "@/features/trade/components/TickerOverview/TickerPrice";
import { ORDER_FORM_SIDES } from "@/features/trade/constants";

const MarketChartDrawer = () => {
  const haptic = useWebHaptics();
  const [open, setOpen] = useState(false);

  const { coin, isPerps } = useTradeContext((s) => ({
    coin: s.coin,
    isPerps: s.instrumentType === "perps",
  }));

  return (
    <Fragment>
      <AlignHorizontalDistributeCenter
        role="button"
        data-slot="drawer-trigger"
        onClick={() => {
          haptic.trigger("medium");
          setOpen(true);
        }}
        className="size-4.5 text-white"
      />
      <Drawer open={open} onOpenChange={setOpen} direction="right">
        <DrawerContent className="px-0 pt-4 pb-0 standalone:pt-safe-top">
          <div className="w-full overflow-y-auto pb-4 standalone:pb-safe-bottom">
            <DrawerHeader className="sticky top-0 z-10 bg-primary-dark gap-0 px-4 pb-1">
              <DrawerTitle className="w-full flex items-center justify-between gap-2">
                <DrawerClose asChild>
                  <ArrowLeft className="size-5" />
                </DrawerClose>
                <AssetsSelector
                  showTags
                  showTokenImage={false}
                  className="flex-1 mb-0"
                  symbolClassName="text-base"
                />
                <FavoriteButton coin={coin} className="size-5 text-white" />
              </DrawerTitle>

              <DrawerDescription className="sr-only">
                Showing chart of the current market
              </DrawerDescription>
            </DrawerHeader>

            <div className="w-full mb-16">
              <div className="w-full grid grid-cols-2 md:flex md:items-center md:gap-6 bg-primary-dark px-4 py-2 md:rounded-md">
                <TickerPrice />

                <TickerContexts />
              </div>

              <MarketArea />
            </div>

            <DrawerFooter className="fixed inset-x-0 bottom-4 z-10 pt-2 flex flex-row items-center bg-primary-dark">
              {Object.entries(ORDER_FORM_SIDES).map(([side, label]) => (
                <DrawerClose
                  key={side}
                  className={cn(
                    "flex-1 w-full h-10 flex items-center justify-center rounded-lg text-center text-neutral-gray-400 cursor-pointer transition-colors",
                    {
                      "bg-sell text-white": side === "sell",
                      "bg-buy text-white": side === "buy",
                    },
                  )}
                  onClick={() =>
                    useOrderFormStore
                      .getState()
                      .onOrderSideChange(side as OrderSide, !isPerps)
                  }
                >
                  <p className="text-sm font-semibold">
                    {label[isPerps ? "perp" : "spot"]}
                  </p>
                </DrawerClose>
              ))}
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </Fragment>
  );
};

export default MarketChartDrawer;
