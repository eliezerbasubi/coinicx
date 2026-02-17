"use client";

import React, { useEffect } from "react";
import { redirect } from "next/navigation";

import { InstrumentType } from "@/types/trade";
import { ROUTES } from "@/constants/routes";
import {
  DEFAULT_PERPS_ASSETS,
  DEFAULT_SPOT_ASSETS,
} from "@/features/trade/constants";
import { useMetaAndAssetCtxs } from "@/features/trade/hooks/useMetaAndAssetCtxs";
import { useInstrumentStore } from "@/store/trade/instrument";
import TradeStoreProvider from "@/store/trade/provider";

import { parseBuilderDeployedAsset } from "../utils";

const TradeProvider = ({
  children,
  ...props
}: React.PropsWithChildren<{
  instrumentType: InstrumentType;
  base: string;
  quote: string;
}>) => {
  const { data, getTokenMeta } = useMetaAndAssetCtxs();

  const tokenMeta = getTokenMeta(props.instrumentType, props.base, props.quote);

  useEffect(() => {
    if (tokenMeta) {
      useInstrumentStore.setState({
        assetMeta: tokenMeta,
      });
    }
  }, [tokenMeta]);

  if (
    (props.instrumentType === "spot" &&
      data.spotMeta?.tokens.length &&
      !tokenMeta) ||
    (props.instrumentType === "perps" && data.perpMetas?.length && !tokenMeta)
  ) {
    let path = `${ROUTES.trade.index}/${props.instrumentType}`;

    if (props.instrumentType === "spot") {
      path += `/${DEFAULT_SPOT_ASSETS.base}/${DEFAULT_SPOT_ASSETS.quote}`;
    } else {
      path += `/${DEFAULT_PERPS_ASSETS.base}`;
    }

    redirect(path);
  }

  return (
    <TradeStoreProvider
      {...props}
      coin={props.base}
      base={parseBuilderDeployedAsset(props.base).base}
    >
      {children}
    </TradeStoreProvider>
  );
};

export default TradeProvider;
