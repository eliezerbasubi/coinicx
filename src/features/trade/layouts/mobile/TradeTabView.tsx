import Link from "next/link";

import { ROUTES } from "@/lib/constants/routes";
import { useTradeContext } from "@/lib/store/trade/hooks";
import { useShallowOrderFormStore } from "@/lib/store/trade/order-form";
import { OrderType } from "@/lib/types/trade";
import { cn } from "@/lib/utils/cn";
import OfflineBanner from "@/components/common/OfflineBanner";
import SwapDrawer from "@/features/swap/components/SwapDrawer";
import AssetsSelector from "@/features/trade/components/AssetsSelector";
import OrderBookCompare from "@/features/trade/components/OrderBook/OrderBookCompare";
import { OrderBookSelector } from "@/features/trade/components/OrderBook/OrderBookSelector";
import OrderBookTable from "@/features/trade/components/OrderBook/OrderBookTable";
import OrderForm from "@/features/trade/components/OrderForm/OrderForm";
import FavoriteButton from "@/features/trade/components/TickerOverview/FavoriteButton";
import TradeUserInfo from "@/features/trade/components/TradeUserInfo";
import {
  DEFAULT_PERPS_ASSETS,
  DEFAULT_SPOT_ASSETS,
} from "@/features/trade/constants";

import MarketChartDrawer from "./MarketChartDrawer";

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
  const { instrumentType, coin } = useTradeContext((s) => ({
    instrumentType: s.instrumentType,
    coin: s.coin,
  }));

  const { orderType, showTpSl } = useShallowOrderFormStore((s) => ({
    orderType: s.settings.orderType,
    showTpSl: s.settings.showTpSl,
  }));

  const visibleRows = getVisibleRows({
    orderType,
    showTpSl,
    isSpot: instrumentType === "spot",
  });

  return (
    <div className="bg-trade-dark flex flex-col gap-0.5 mb-20">
      <div className="sticky top-0 z-10 bg-primary-dark standalone:pt-safe-top">
        <div className="w-full h-11 flex items-center px-4 md:px-6 gap-x-3 md:gap-x-6">
          <SwapDrawer
            trigger={
              <div className="text-neutral-gray-400 font-semibold">
                <p>Convert</p>
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

        <OfflineBanner />

        <div className="flex items-center justify-between px-4 pt-1 pb-3">
          <AssetsSelector
            showPriceChangePercentage
            showTags={false}
            className="p-0 mb-0"
          />

          <div className="flex-1 flex items-center justify-end gap-x-2.5">
            <MarketChartDrawer />
            <FavoriteButton coin={coin} className="size-4.5 text-white" />
          </div>
        </div>
      </div>
      <div className="w-full bg-primary-dark grid grid-cols-[auto_1fr] sm:grid-cols-2 pb-4">
        <div className="size-full max-w-45 sm:max-w-full flex flex-col bg-primary-dark rounded-md">
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

      <TradeUserInfo />
    </div>
  );
};

export default TradeTabView;
