import { useSuspenseQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/lib/constants/queryKeys";

import { getMarketEventsMetas } from "../lib/queries";

export const useMarketEventsMetas = () => {
  const { data, isLoading, error } = useSuspenseQuery({
    queryKey: [QUERY_KEYS.predictionMarketEvents],
    staleTime: Infinity,
    queryFn: getMarketEventsMetas,
  });

  return { data, isLoading, error };
};
