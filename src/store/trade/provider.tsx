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
      baseAsset: props.baseAsset,
      quoteAsset: props.quoteAsset,
      symbol: props.baseAsset + props.quoteAsset,
      tradeType: props.tradeType,
    });
  }, [props.baseAsset, props.quoteAsset, props.tradeType]);

  return (
    <TradeContext.Provider value={storeRef.current}>
      {children}
    </TradeContext.Provider>
  );
};

export default TradeStoreProvider;
