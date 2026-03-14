import React from "react";

import AccountTransact from "@/features/trade/components/AccountTransact";
import TradingInstrumentProvider from "@/features/trade/providers/trading-instrument-provider";
import UserTradeProvider from "@/features/trade/providers/user-trade-provider";

type Props = {
  children: React.ReactNode;
};

const RootTradingProvider = ({ children }: Props) => {
  return (
    <TradingInstrumentProvider>
      <UserTradeProvider>
        {children}

        <AccountTransact />
      </UserTradeProvider>
    </TradingInstrumentProvider>
  );
};

export default RootTradingProvider;
