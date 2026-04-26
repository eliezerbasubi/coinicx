import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/lib/constants/queryKeys";
import { ROUTES } from "@/lib/constants/routes";
import { hlInfoClient, isTestnet } from "@/lib/services/transport";
import { getQueryClient } from "@/lib/utils/getQueryClient";
import PredictionMarketsSubsProvider from "@/features/predict/providers/prediction-markets-subs";
import { DEFAULT_PERPS_ASSETS } from "@/features/trade/constants";

type Props = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  title: "Prediction Markets",
  description: "Explore and trade on the world's most exciting events",
};

const PredictLayout = async ({ children }: Props) => {
  // TODO: REMOVE THIS LINE ONCE PREDICTIONS ARE ON MAINNET
  if (!isTestnet) redirect(ROUTES.trade.perps + DEFAULT_PERPS_ASSETS.base);

  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    staleTime: Infinity,
    queryKey: QUERY_KEYS.predictionMarketEvents,
    queryFn: () => hlInfoClient.outcomeMeta(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PredictionMarketsSubsProvider>{children}</PredictionMarketsSubsProvider>
    </HydrationBoundary>
  );
};

export default PredictLayout;
