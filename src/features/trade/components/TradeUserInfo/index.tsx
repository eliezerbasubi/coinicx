import { useTradeContext } from "@/store/trade/hooks";

import TradingAccountPanel from "../TradingAccountPanel";

const TradeUserInfo = () => {
  const isPerps = useTradeContext((s) => s.instrumentType === "perps");

  return (
    <TradingAccountPanel
      defaultTab={isPerps ? "positions" : "balances"}
      excludedTabs={["depositAndWithdrawals"]}
      className="md:rounded-md"
    />
  );
};

export default TradeUserInfo;
