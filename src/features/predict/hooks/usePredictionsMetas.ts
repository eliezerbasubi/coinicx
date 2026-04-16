import { useSuspenseQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/lib/constants/queryKeys";
import { hlInfoClient } from "@/lib/services/transport";

import { getPredictionsMetas } from "../lib/queries";

export const usePredictionsMetas = () => {
  const { data, isLoading, error } = useSuspenseQuery({
    queryKey: [QUERY_KEYS.predictionMarketEvents],
    staleTime: Infinity,
    select: getPredictionsMetas,
    queryFn: () => hlInfoClient.outcomeMeta(),
  });

  return { data, isLoading, error };
};
