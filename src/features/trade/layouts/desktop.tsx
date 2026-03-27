import OfflineBanner from "@/components/common/OfflineBanner";

import MarketArea from "../components/MarketArea";
import OrderBook from "../components/OrderBook";
import OrderForm from "../components/OrderForm/OrderForm";
import TickerOverview from "../components/TickerOverview";
import TradeUserInfo from "../components/TradeUserInfo";
import UserAccountInfo from "../components/UserAccountInfo";

const TradingDesktopLayout = () => {
  return (
    <div className="w-full">
      <OfflineBanner />
      <div className="bg-trade-dark w-full flex gap-1 py-0.5 md:p-1 flex-wrap md:flex-nowrap">
        {/* We're adding min-w-0 to fix broken UI due to whitespace-nowrap in TickerOverview */}
        <div className="w-full min-w-0 space-y-1">
          <TickerOverview />

          <div className="flex gap-1 md:flex-wrap-reverse lg:flex-nowrap">
            {/* We're adding more rows to keep the UI responsive */}
            <OrderBook
              orientation="vertical"
              sideVisibleRows={22}
              className="shrink-0"
            />
            <MarketArea excludeTabs={["orderbook"]} />
          </div>
        </div>
        <OrderForm />
      </div>
      <div className="w-full bg-trade-dark flex gap-1 py-0.5 md:px-1 md:pb-2 md:pt-0 flex-wrap md:flex-nowrap">
        <TradeUserInfo />
        <UserAccountInfo />
      </div>
    </div>
  );
};

export default TradingDesktopLayout;
