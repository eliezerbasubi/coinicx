import React from "react";
import { redirect } from "next/navigation";

import { getTradePathParams } from "@/components/trade/utils/getTradePathParams";
import { ROUTES } from "@/constants/routes";
import TradeStoreProvider from "@/store/trade/provider";

type Props = {
  params: Promise<{ slug: string[] }>;
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
    <TradeStoreProvider
      tradeType={pathParams.type}
      baseAsset={pathParams.baseAsset}
      quoteAsset={pathParams.quoteAsset}
    >
      {children}
    </TradeStoreProvider>
  );
};

export default TradeLayout;
