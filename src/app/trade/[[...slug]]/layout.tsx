import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";

import TradeProvider from "@/components/trade/provider";
import { getTradePathParams } from "@/components/trade/utils/getTradePathParams";
import { ROUTES } from "@/constants/routes";

type Props = {
  params: Promise<{ slug: string[] }>;
};

export const metadata: Metadata = {
  title: "CoinicX Spot Trading",
  description: "Trade beyond the edge",
};

const TradeLayout = async ({
  params,
  children,
}: React.PropsWithChildren<Props>) => {
  const { slug } = await params;

  const pathParams = getTradePathParams(slug);

  if (pathParams.redirect) {
    redirect(
      `${ROUTES.trade.index}/${pathParams.type}/${pathParams.baseAsset}/${pathParams.quoteAsset}`,
    );
  }

  return (
    <TradeProvider
      tradeType={pathParams.type}
      baseAsset={pathParams.baseAsset}
      quoteAsset={pathParams.quoteAsset}
    >
      {children}
    </TradeProvider>
  );
};

export default TradeLayout;
