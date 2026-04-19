"use client";

import React from "react";
import { redirect } from "next/navigation";

import { ROUTES } from "@/lib/constants/routes";
import { InstrumentType } from "@/lib/types/trade";
import {
  DEFAULT_PERPS_ASSETS,
  DEFAULT_SPOT_ASSETS,
} from "@/features/trade/constants";
import { useAssetMetas } from "@/features/trade/hooks/useAssetMetas";
import TradeStoreProvider from "@/features/trade/store/provider";

import TradingPairSubsProvider from "./trading-pair-subs-provider";

const TradingPairProvider = ({
  children,
  ...props
}: React.PropsWithChildren<{
  instrumentType: InstrumentType;
  base: string;
  quote: string;
}>) => {
  const { spotMeta, perpMetas, getTokenMeta } = useAssetMetas();

  const tokenMeta = getTokenMeta(props.instrumentType, props.base, props.quote);

  if (
    (props.instrumentType === "spot" &&
      spotMeta?.tokens.length &&
      !tokenMeta) ||
    (props.instrumentType === "perps" && perpMetas?.length && !tokenMeta)
  ) {
    let path = `${ROUTES.trade.index}/${props.instrumentType}`;

    if (props.instrumentType === "spot") {
      path += `/${DEFAULT_SPOT_ASSETS.base}/${DEFAULT_SPOT_ASSETS.quote}`;
    } else {
      path += `/${DEFAULT_PERPS_ASSETS.base}`;
    }

    redirect(path);
  }

  // TODO: Maybe we should show a not found page instead of returning null
  if (!tokenMeta) return null;

  return (
    <TradeStoreProvider {...props} assetMeta={tokenMeta}>
      <TradingPairSubsProvider>{children}</TradingPairSubsProvider>
    </TradeStoreProvider>
  );
};

export default TradingPairProvider;
