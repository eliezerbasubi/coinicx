import React from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/lib/constants/queryKeys";
import { getQueryClient } from "@/lib/utils/getQueryClient";
import { getPredictionsMetas } from "@/features/predict/lib/queries";

type Props = {
  children: React.ReactNode;
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
      {children}
    </HydrationBoundary>
  );
};

export default PredictLayout;
