import { useTradeContext } from "@/lib/store/trade/hooks";

import TradingAccountPanel from "../TradingAccountPanel";

type Props = {
  excludeTabs?: React.ComponentProps<typeof TradingAccountPanel>["excludeTabs"];
};

const TradeUserInfo = ({ excludeTabs }: Props) => {
  const isPerps = useTradeContext((s) => s.instrumentType === "perps");

  return (
    <TradingAccountPanel
      defaultTab={isPerps ? "positions" : "balances"}
      excludeTabs={excludeTabs ?? ["depositAndWithdrawals"]}
      className="md:rounded-md"
    />
  );
};

export default TradeUserInfo;
