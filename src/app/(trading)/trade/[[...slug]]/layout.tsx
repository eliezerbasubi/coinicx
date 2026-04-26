import { use } from "react";
import { redirect } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/lib/constants/queryKeys";
import { ROUTES } from "@/lib/constants/routes";
import { hlInfoClient, isTestnet } from "@/lib/services/transport";
import { getQueryClient } from "@/lib/utils/getQueryClient";
import { DEFAULT_SPOT_ASSETS } from "@/features/trade/constants";
import TradingPairProvider from "@/features/trade/providers/trading-pair-provider";
import { getTradePathParams } from "@/features/trade/utils/getTradePathParams";

const TradeLayout = ({
  params,
  children,
}: LayoutProps<"/trade/[[...slug]]">) => {
  const { slug } = use(params);

  const queryClient = prefetchQueries();

  const pathParams = getTradePathParams(slug);

  if (pathParams.redirect) {
    let path = `${ROUTES.trade.index}/${pathParams.type}/${pathParams.base}`;
    if (pathParams.quote) {
      path += `/${pathParams.quote}`;
    }
    redirect(path);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TradingPairProvider
        instrumentType={pathParams.type}
        base={pathParams.base}
        quote={pathParams.quote ?? DEFAULT_SPOT_ASSETS.quote}
      >
        {children}
      </TradingPairProvider>
    </HydrationBoundary>
  );
};

export default TradeLayout;

/** Prefetch queries for the trade page. We skip awaiting for PPR (Partial Prerendering) */
const prefetchQueries = () => {
  const queryClient = getQueryClient();

  queryClient.prefetchQuery({
    queryKey: QUERY_KEYS.allPerpMetas,
    queryFn: () => hlInfoClient.allPerpMetas(),
    staleTime: Infinity,
  });

  queryClient.prefetchQuery({
    queryKey: QUERY_KEYS.spotMeta,
    queryFn: () => hlInfoClient.spotMeta(),
    staleTime: Infinity,
  });

  // TODO: REMOVE THIS LINE ONCE PREDICTIONS ARE ON MAINNET
  if (isTestnet) {
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.predictionMarketEvents,
      queryFn: () => hlInfoClient.outcomeMeta(),
      staleTime: Infinity,
    });
  }

  return queryClient;
};
