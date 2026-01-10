"use client";

import React from "react";
import { redirect } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { ROUTES } from "@/constants/routes";
import { getProductBySymbol } from "@/services/trade";
import TradeStoreProvider from "@/store/trade/provider";
import { TradeStoreProps } from "@/store/trade/store";

import { defaultTradeAsset } from "../constants";

const TradeProvider = ({
  children,
  ...props
}: React.PropsWithChildren<Omit<TradeStoreProps, "marketTicker">>) => {
  const symbol = props.baseAsset + props.quoteAsset;

  const { data, error } = useQuery({
    queryKey: [QUERY_KEYS.tradeTicker, symbol],
    queryFn: () => getProductBySymbol(symbol),
    staleTime: Infinity,
  });

  // Redirect to default assets if token is not found
  if (error) {
    redirect(
      `${ROUTES.trade.index}/${props.tradeType}/${defaultTradeAsset.baseAsset}/${defaultTradeAsset.quoteAsset}`,
    );
  }

  return (
    <TradeStoreProvider {...props} marketTicker={data}>
      {children}
    </TradeStoreProvider>
  );
};

export default TradeProvider;
