"use client";

import React, { useEffect, useRef } from "react";

import {
  createSpotTradeStore,
  SpotTradeContext,
  SpotTradeProps,
  SpotTradeStore,
} from "./spot";

const SpotTradeStoreProvider = ({
  children,
  ...props
}: React.PropsWithChildren<SpotTradeProps>) => {
  const storeRef = useRef<SpotTradeStore>(null);

  if (!storeRef.current) {
    storeRef.current = createSpotTradeStore(props);
  }

  useEffect(() => {
    storeRef.current?.setState({
      baseAsset: props.baseAsset,
      quoteAsset: props.quoteAsset,
      symbol: props.baseAsset + props.quoteAsset,
    });
  }, [props.baseAsset, props.quoteAsset]);

  return (
    <SpotTradeContext.Provider value={storeRef.current}>
      {children}
    </SpotTradeContext.Provider>
  );
};

export default SpotTradeStoreProvider;
