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
      ...props,
    });
  }, [props]);

  return (
    <TradeContext.Provider value={storeRef.current}>
      {children}
    </TradeContext.Provider>
  );
};

export default TradeStoreProvider;
