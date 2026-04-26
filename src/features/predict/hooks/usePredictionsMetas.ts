import { useSuspenseQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/lib/constants/queryKeys";
import { hlInfoClient } from "@/lib/services/transport";

import { mapDataToPredictionsMetas } from "../lib/utils/mapper";

export const usePredictionsMetas = () => {
  const { data, isLoading, error } = useSuspenseQuery({
    queryKey: QUERY_KEYS.predictionMarketEvents,
    staleTime: Infinity,
    select: mapDataToPredictionsMetas,
    queryFn: () => hlInfoClient.outcomeMeta(),
  });

  return { data, isLoading, error };
};
