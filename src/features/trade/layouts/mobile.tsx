import { Activity, useRef } from "react";
import { CandlestickChart, Coins, User } from "lucide-react";

import { MobileViewTab, OrderType } from "@/types/trade";
import { Button } from "@/components/ui/button";
import { useShallowOrderFormStore } from "@/store/trade/order-form";
import {
  usePreferencesStore,
  useShallowPreferencesStore,
} from "@/store/trade/user-preferences";
import { cn } from "@/utils/cn";

import MarketArea from "../components/MarketArea";
import OrderBookCompare from "../components/OrderBook/OrderBookCompare";
import { OrderBookSelector } from "../components/OrderBook/OrderBookSelector";
import OrderBookTable from "../components/OrderBook/OrderBookTable";
import OrderForm from "../components/OrderForm/OrderForm";
import TickerOverview from "../components/TickerOverview";
import TradeUserInfo from "../components/TradeUserInfo";
import UserAccountInfo from "../components/UserAccountInfo";

const TradingMobileLayout = () => {
  const activeTab = useShallowPreferencesStore((s) => s.mobileViewTab);

  return (
    <div className="w-full bg-trade-dark flex flex-col gap-1 pt-0.5 md:p-1 mb-20">
      <Activity mode={activeTab !== "account" ? "visible" : "hidden"}>
        <TickerOverview />
      </Activity>

      <Activity mode={activeTab === "markets" ? "visible" : "hidden"}>
        <MarketArea />
      </Activity>

      <Activity mode={activeTab === "trade" ? "visible" : "hidden"}>
        <TradeTabView />
      </Activity>

      <Activity mode={activeTab === "account" ? "visible" : "hidden"}>
        <UserAccountInfo />
      </Activity>

      <Activity mode={activeTab !== "trade" ? "visible" : "hidden"}>
        {/* Show all tabs in account tab view */}
        <TradeUserInfo excludeTabs={activeTab === "account" ? [] : undefined} />
      </Activity>

      <BottomNavBar
        value={activeTab}
        onValueChange={(value) =>
          usePreferencesStore.getState().dispatch({ mobileViewTab: value })
        }
      />
    </div>
  );
};

/**
 * Number of visible items to display on the book.
 * Only returning the visible rows for the orderbook layout type.
 * The visible rows for the side layout type will be the double of the orderbook layout to keep the layout responsive
 * @param orderType current order type
 * @param showTpSl whether TP/SL form is visible
 * @returns number of visible rows
 */
const getVisibleRows = (orderType: OrderType, showTpSl?: boolean) => {
  switch (orderType) {
    case "market":
    case "limit":
      return showTpSl ? 9 : 7;
    case "stopLimit":
      return 8;
    case "scale":
    case "twap":
      return 9;

    default:
      return 7;
  }
};

const TradeTabView = () => {
  const { orderType, showTpSl } = useShallowOrderFormStore((s) => ({
    orderType: s.settings.orderType,
    showTpSl: s.settings.showTpSl,
  }));

  const visibleRows = getVisibleRows(orderType, showTpSl);

  return (
    <div className="w-full bg-primary-dark grid grid-cols-[auto_1fr]">
      <div className="size-full max-w-45 flex flex-col bg-primary-dark rounded-md">
        <OrderBookTable
          hideAvgPriceTooltip
          hideCumulativeTotal
          orientation="vertical"
          orderbookVisibleRows={visibleRows}
          sideVisibleRows={visibleRows * 2}
          className="flex-1"
          tickerClassName="py-1"
          headerClassName="pr-3"
          listWrapperClassName="pr-3"
        />

        <OrderBookCompare
          showOnSideLayout
          hideLabels
          className="pt-1 pb-0.5 pr-3 text-2xs"
        />
        <OrderBookSelector layoutStyle="stacked" className="py-0 pr-3" />
      </div>
      <OrderForm className="flex-1 pr-4 pt-2" />
    </div>
  );
};

const BOTTOM_NAV_TABS = [
  { label: "Markets", value: "markets", icon: <CandlestickChart /> },
  { label: "Trade", value: "trade", icon: <Coins /> },
  { label: "Account", value: "account", icon: <User /> },
] as const;

const GAP = 8;
const PADDING = 4;
const MAX_WIDTH = 256;

const BottomNavBar = ({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange?: (value: MobileViewTab) => void;
}) => {
  const currentNavItemIndex = BOTTOM_NAV_TABS.findIndex(
    (item) => item.value === value,
  );

  const ref = useRef<HTMLDivElement>(null);
  const itemsCount = BOTTOM_NAV_TABS.length;

  const width = ref.current?.getBoundingClientRect().width ?? MAX_WIDTH;

  const effectiveWidth = width - PADDING - GAP;

  return (
    <div className="fixed bottom-4 inset-x-0 z-10 h-14">
      <div
        ref={ref}
        style={{
          gap: GAP,
          padding: PADDING,
          maxWidth: MAX_WIDTH,
        }}
        className="relative isolate w-full mx-auto flex items-center border border-neutral-gray-200 bg-trade-dark rounded-full"
      >
        {BOTTOM_NAV_TABS.map((item) => (
          <Button
            key={item.value}
            type="button"
            size="lg"
            variant="ghost"
            className={cn(
              "h-11 flex-1 flex flex-col gap-y-0.5 items-center justify-center [&>svg]:size-4! px-0!",
              {
                "text-primary": item.value === value,
              },
            )}
            onClick={() => onValueChange?.(item.value)}
          >
            {item.icon}
            <p className="text-2xs font-medium">{item.label}</p>
          </Button>
        ))}
        <div
          style={{
            width: `calc(100%/${itemsCount})`,
            transform: `translateX(${Math.floor(effectiveWidth / itemsCount) * currentNavItemIndex}px)`,
          }}
          className="absolute inset-y-1 -z-1 bg-neutral-gray-200 rounded-full transition-transform will-change-transform ease-in-out"
        />
      </div>
    </div>
  );
};

export default TradingMobileLayout;
