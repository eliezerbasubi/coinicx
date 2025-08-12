"use client";

import React, { useEffect, useRef } from "react";

import {
  createTradeStore,
  TradeContext,
  TradeStore,
  TradeStoreProps,
} from "./store";

const TradeStoreProvider = ({
  children,
  ...props
}: React.PropsWithChildren<TradeStoreProps>) => {
  const storeRef = useRef<TradeStore>(null);

  if (!storeRef.current) {
    storeRef.current = createTradeStore(props);
  }

  useEffect(() => {
    storeRef.current?.setState({
      symbol: props.baseAsset + props.quoteAsset,
      ...props,
    });
  }, [props.baseAsset, props.quoteAsset, props.tradeType, props.marketTicker]);

  return (
    <TradeContext.Provider value={storeRef.current}>
      {children}
    </TradeContext.Provider>
  );
};

export default TradeStoreProvider;
