import MarketArea from "../components/MarketArea";
import OrderBook from "../components/OrderBook";
import OrderForm from "../components/OrderForm/OrderForm";
import TickerOverview from "../components/TickerOverview";
import TradeUserInfo from "../components/TradeUserInfo";
import UserAccountInfo from "../components/UserAccountInfo";

const TradingTabletLayout = () => {
  return (
    <div className="w-full">
      <div className="bg-trade-dark w-full py-0.5 md:p-1">
        <TickerOverview />
        <div className="w-full flex pt-1 gap-1">
          <div className="flex-1 flex flex-col lg:flex-row-reverse gap-1">
            <MarketArea
              excludeTabs={["orderbook"]}
              className="flex-1 min-h-96 lg:min-h-auto"
            />
            <OrderBook
              hideAvgPriceTooltip
              hideCompare
              orientation="vertical"
              orderbookVisibleRows={3}
              sideVisibleRows={6}
            />
          </div>
          <OrderForm />
        </div>
      </div>
      <div className="w-full bg-trade-dark flex gap-1 py-0.5 md:px-1 md:pb-2 md:pt-0">
        <TradeUserInfo />
        <UserAccountInfo />
      </div>
    </div>
  );
};

export default TradingTabletLayout;
