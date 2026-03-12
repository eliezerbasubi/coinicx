import OrderFormMobile from "../components/OrderForm/OrderFormMobile";
import TickerOverview from "../components/TickerOverview";
import TradeChartArea from "../components/TradeChartArea";
import TradeUserInfo from "../components/TradeUserInfo";
import UserAccountInfo from "../components/UserAccountInfo";

const TradingMobileLayout = () => {
  return (
    <div className="w-full">
      <div className="bg-trade-dark w-full flex gap-1 py-0.5 md:p-1 flex-wrap md:flex-nowrap">
        <div className="w-full space-y-1">
          <TickerOverview />

          <TradeChartArea />
        </div>
        <OrderFormMobile />
      </div>
      <div className="w-full bg-trade-dark flex gap-1 py-0.5 md:px-1 md:pb-2 flex-wrap md:flex-nowrap">
        <TradeUserInfo />
        <UserAccountInfo />
      </div>
    </div>
  );
};

export default TradingMobileLayout;
