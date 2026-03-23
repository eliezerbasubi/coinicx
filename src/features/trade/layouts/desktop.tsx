import MarketArea from "../components/MarketArea";
import OrderBook from "../components/OrderBook";
import OrderForm from "../components/OrderForm/OrderForm";
import TickerOverview from "../components/TickerOverview";
import TradeUserInfo from "../components/TradeUserInfo";
import UserAccountInfo from "../components/UserAccountInfo";
import OfflineBanner from "@/components/common/OfflineBanner";

const TradingDesktopLayout = () => {
  return (
    <div className="w-full">
      <OfflineBanner />
      <div className="bg-trade-dark w-full flex gap-1 py-0.5 md:p-1 flex-wrap md:flex-nowrap">
        <div className="w-full space-y-1">
          <TickerOverview />

          <div className="flex gap-1 md:flex-wrap-reverse xl:flex-nowrap">
            {/* We're adding more rows to keep the UI responsive */}
            <OrderBook orientation="vertical" sideVisibleRows={22} />
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
