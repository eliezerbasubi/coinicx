import { useSuspenseQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/lib/constants/queryKeys";

import { getPredictionsMetas } from "../lib/queries";

export const usePredictionsMetas = () => {
  const { data, isLoading, error } = useSuspenseQuery({
    queryKey: [QUERY_KEYS.predictionMarketEvents],
    staleTime: Infinity,
    queryFn: getPredictionsMetas,
  });

  return { data, isLoading, error };
};
