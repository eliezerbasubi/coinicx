import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/lib/constants/queryKeys";
import { hlInfoClient } from "@/lib/services/transport";

export const useMarketEventsMetas = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: [QUERY_KEYS.predictionMarketEvents],
    staleTime: Infinity,
    queryFn: () => hlInfoClient.outcomeMeta(),
  });

  return { data, isLoading, error };
};
