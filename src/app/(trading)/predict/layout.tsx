import React from "react";
import { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/lib/constants/queryKeys";
import { getQueryClient } from "@/lib/utils/getQueryClient";
import { getPredictionsMetas } from "@/features/predict/lib/queries";
import MarketEventsSubscriptions from "@/features/predict/providers/market-events-subs";

type Props = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  title: "Prediction Markets",
  description: "Explore and trade on the world's most exciting events",
};

const PredictLayout = async ({ children }: Props) => {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    staleTime: Infinity,
    queryKey: [QUERY_KEYS.predictionMarketEvents],
    queryFn: getPredictionsMetas,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MarketEventsSubscriptions>{children}</MarketEventsSubscriptions>
    </HydrationBoundary>
  );
};

export default PredictLayout;
