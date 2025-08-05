import React from "react";
import { redirect } from "next/navigation";

import { getTradePathParams } from "@/components/trade/utils/getTradePathParams";
import SpotTradeStoreProvider from "@/store/trade/provider";

type Props = {
  params: Promise<{ slug: string[] }>;
};

const TradeSpotLayout = async ({
  params,
  children,
}: React.PropsWithChildren<Props>) => {
  const { slug } = await params;

  const pathParams = getTradePathParams(slug);

  if (pathParams.redirect) {
    redirect(`/${pathParams.baseAsset}/${pathParams.quoteAsset}`);
  }

  return (
    <SpotTradeStoreProvider
      baseAsset={pathParams.baseAsset}
      quoteAsset={pathParams.quoteAsset}
    >
      {children}
    </SpotTradeStoreProvider>
  );
};

export default TradeSpotLayout;
