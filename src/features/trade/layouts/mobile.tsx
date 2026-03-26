import { Activity, useRef, useState } from "react";
import Link from "next/link";
import { CandlestickChart, RefreshCcwDot, User } from "lucide-react";
import { useWebHaptics } from "web-haptics/react";

import { ROUTES } from "@/lib/constants/routes";
import { useTradeContext } from "@/lib/store/trade/hooks";
import { useShallowOrderFormStore } from "@/lib/store/trade/order-form";
import {
  usePreferencesStore,
  useShallowPreferencesStore,
} from "@/lib/store/trade/user-preferences";
import { MobileViewTab, OrderType } from "@/lib/types/trade";
import { cn } from "@/lib/utils/cn";
import OfflineBanner from "@/components/common/OfflineBanner";
import Visibility from "@/components/common/Visibility";
import { Button } from "@/components/ui/button";
import SwapDrawer from "@/features/swap/components/SwapDrawer";
import MarketArea from "@/features/trade/components/MarketArea";
import OrderBookCompare from "@/features/trade/components/OrderBook/OrderBookCompare";
import { OrderBookSelector } from "@/features/trade/components/OrderBook/OrderBookSelector";
import OrderBookTable from "@/features/trade/components/OrderBook/OrderBookTable";
import OrderForm from "@/features/trade/components/OrderForm/OrderForm";
import TickerOverview from "@/features/trade/components/TickerOverview";
import TradeUserInfo from "@/features/trade/components/TradeUserInfo";
import UserAccountInfoMobile from "@/features/trade/components/UserAccountInfo/UserAccountInfoMobile";
import {
  DEFAULT_PERPS_ASSETS,
  DEFAULT_SPOT_ASSETS,
} from "@/features/trade/constants";

const TRADING_TABS = [
  {
    label: "Spot",
    value: "spot",
    href: `${ROUTES.trade.spot}/${DEFAULT_SPOT_ASSETS.base}/${DEFAULT_SPOT_ASSETS.quote}`,
  },
  {
    label: "Perps",
    value: "perps",
    href: `${ROUTES.trade.perps}/${DEFAULT_PERPS_ASSETS.base}`,
  },
] as const;

const TradingMobileLayout = () => {
  const activeTab = useShallowPreferencesStore((s) => s.mobileViewTab);
  const instrumentType = useTradeContext((s) => s.instrumentType);

  const [isSwapOpen, setIsSwapOpen] = useState(false);

  return (
    <div className="w-full">
      <Visibility visible={activeTab !== "account"}>
        <div className="sticky top-0 z-10 bg-primary-dark standalone:pt-safe-top">
          <div className="w-full h-11 flex items-center px-4 md:px-6 gap-x-3 md:gap-x-6">
            <SwapDrawer
              trigger={
                <div className="text-neutral-gray-400 font-semibold">
                  <p className="text-xs font-medium">Convert</p>
                </div>
              }
            />
            {TRADING_TABS.map((tab) => (
              <Link
                prefetch
                href={tab.href}
                key={tab.value}
                className={cn("text-neutral-gray-400 font-semibold", {
                  "text-white": instrumentType === tab.value,
                })}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          <Visibility
            visible={activeTab === "markets" || activeTab === "trade"}
          >
            <OfflineBanner />
          </Visibility>
        </div>
      </Visibility>
      <div className="w-full bg-trade-dark flex flex-col gap-0.5 mb-20">
        <Activity mode={activeTab !== "account" ? "visible" : "hidden"}>
          {/* Stick the ticker overview below the header by increasing to safe area top by the header in standalone mode */}
          {/* Add the height of the header to the top position of the ticker overview */}
          <TickerOverview className="sticky top-11 standalone:top-[calc(env(safe-area-inset-top,0px)+44px)] bg-primary-dark z-6 pt-1" />
        </Activity>

        <Activity mode={activeTab === "markets" ? "visible" : "hidden"}>
          <MarketArea />
        </Activity>

        <Activity mode={activeTab === "trade" ? "visible" : "hidden"}>
          <TradeTabView />
        </Activity>

        <Activity mode={activeTab === "account" ? "visible" : "hidden"}>
          <UserAccountInfoMobile />
        </Activity>

        <Activity mode={activeTab !== "account" ? "visible" : "hidden"}>
          <TradeUserInfo />
        </Activity>

        <BottomNavBar
          value={activeTab}
          onValueChange={(value) =>
            usePreferencesStore.getState().dispatch({ mobileViewTab: value })
          }
        />
      </div>
      <SwapDrawer open={isSwapOpen} onOpenChange={setIsSwapOpen} />
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
const getVisibleRows = (params: {
  orderType: OrderType;
  showTpSl?: boolean;
  isSpot: boolean;
}) => {
  switch (params.orderType) {
    case "market":
    case "limit":
      return params.isSpot ? 4 : params.showTpSl ? 9 : 7;
    case "stopLimit":
      return 8;
    case "scale":
    case "twap":
      return params.isSpot ? 5 : 9;

    default:
      return 7;
  }
};

const TradeTabView = () => {
  const isSpot = useTradeContext((s) => s.instrumentType === "spot");

  const { orderType, showTpSl } = useShallowOrderFormStore((s) => ({
    orderType: s.settings.orderType,
    showTpSl: s.settings.showTpSl,
  }));

  const visibleRows = getVisibleRows({ orderType, showTpSl, isSpot });

  return (
    <div className="w-full bg-primary-dark grid grid-cols-[auto_1fr] pb-4">
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
  { label: "Trade", value: "trade", icon: <RefreshCcwDot /> },
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
  const haptic = useWebHaptics();
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
            onClick={() => {
              haptic.trigger("selection");
              onValueChange?.(item.value);
            }}
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
