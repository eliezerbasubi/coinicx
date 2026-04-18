import React from "react";
import { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/lib/constants/queryKeys";
import { hlInfoClient } from "@/lib/services/transport";
import { getQueryClient } from "@/lib/utils/getQueryClient";
import PredictionMarketsSubsProvider from "@/features/predict/providers/prediction-markets-subs";

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
    queryFn: () => hlInfoClient.outcomeMeta(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PredictionMarketsSubsProvider>{children}</PredictionMarketsSubsProvider>
    </HydrationBoundary>
  );
};

export default PredictLayout;
