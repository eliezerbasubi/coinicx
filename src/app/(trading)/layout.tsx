import React from "react";

import TradingInstrumentProvider from "@/features/trade/providers/trading-instrument-provider";
import UserTradeProvider from "@/features/trade/providers/user-trade-provider";

type Props = {
  children: React.ReactNode;
};

const RootTradingProvider = ({ children }: Props) => {
  return (
    <TradingInstrumentProvider>
      <UserTradeProvider>{children}</UserTradeProvider>
    </TradingInstrumentProvider>
  );
};

export default RootTradingProvider;
