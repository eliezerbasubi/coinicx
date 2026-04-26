"use client";

import React, { useEffect, useRef } from "react";

import {
  createMarketEventStore,
  MarketEventContext,
  MarketEventStore,
  MarketEventStoreProps,
} from "./store";

const MarketEventStoreProvider = ({
  children,
  ...props
}: React.PropsWithChildren<MarketEventStoreProps>) => {
  const storeRef = useRef<MarketEventStore>(null);

  if (!storeRef.current) {
    storeRef.current = createMarketEventStore(props);
  }

  useEffect(() => {
    storeRef.current?.setState({
      ...props,
    });
  }, [props]);

  return (
    <MarketEventContext.Provider value={storeRef.current}>
      {children}
    </MarketEventContext.Provider>
  );
};

export default MarketEventStoreProvider;
