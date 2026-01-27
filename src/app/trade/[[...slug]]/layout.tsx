import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { DEFAULT_SPOT_ASSETS } from "@/features/trade/constants";
import TradeProvider from "@/features/trade/providers/trade-provider";
import UserTradeProvider from "@/features/trade/providers/user-trade-provider";
import { getTradePathParams } from "@/features/trade/utils/getTradePathParams";

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
    let path = `${ROUTES.trade.index}/${pathParams.type}/${pathParams.base}`;
    if (pathParams.quote) {
      path += `/${pathParams.quote}`;
    }
    redirect(path);
  }

  return (
    <TradeProvider
      instrumentType={pathParams.type}
      base={pathParams.base}
      quote={pathParams.quote ?? DEFAULT_SPOT_ASSETS.quote}
    >
      <UserTradeProvider>{children}</UserTradeProvider>
    </TradeProvider>
  );
};

export default TradeLayout;
