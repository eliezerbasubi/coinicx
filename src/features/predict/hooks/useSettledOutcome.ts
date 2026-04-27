import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/lib/constants/queryKeys";
import { hlInfoClient } from "@/lib/services/transport";

import { MarketEventMeta } from "../lib/types";
import { mapOutcomeSpecToMarketEventMeta } from "../lib/utils/mapper";
import { parseSettledOutcomeDetails } from "../lib/utils/parseMetadata";

type UseSettledOutcomeArgs = {
  outcomeId: number | null;
  enabled?: boolean;
};

type SettleOutcomeSpec = {
  spec: {
    outcome: number;
    name: string;
    description: string;
    sideSpecs: { name: string }[];
  };
  settleFraction: string;
  details: string;
};

export const useSettledOutcome = (args: UseSettledOutcomeArgs) => {
  const enabled = args.enabled ?? true;

  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEYS.settledOutcome(args.outcomeId),
    enabled: !!args.outcomeId && enabled,
    staleTime: Infinity,
    select: mapDataToSettledOutcome,
    queryFn: async () => {
      const settledOutcome =
        await hlInfoClient.config_.transport.request<SettleOutcomeSpec>(
          "info",
          {
            type: "settledOutcome",
            outcome: args.outcomeId,
          },
        );

      return settledOutcome;
    },
  });

  const { data, isLoading, error, status } = query;

  const lastOutcomeRef = useRef<number | null>(null);

  useEffect(() => {
    if (data != null && args.outcomeId !== lastOutcomeRef.current) {
      lastOutcomeRef.current = args.outcomeId;

      const persistedSettledOutcome = queryClient.getQueryData(
        QUERY_KEYS.settledOutcome(args.outcomeId),
      );

      // Persist the settled outcome in cache to prevent the hook from refetching it.
      if (!persistedSettledOutcome) {
        queryClient.setQueryData(
          QUERY_KEYS.settledOutcome(args.outcomeId),
          data,
        );
      }
    }
  }, [data, args.outcomeId, queryClient]);

  return { data, isLoading, error, status };
};

const mapDataToSettledOutcome = (data: SettleOutcomeSpec): MarketEventMeta => {
  const marketEvent = mapOutcomeSpecToMarketEventMeta(data.spec);
  const settlement = parseSettledOutcomeDetails(data.details);

  const settleFraction = parseInt(data.settleFraction, 10);

  return {
    ...marketEvent,
    status: "settled",
    // If settle fraction is 1, it means the second side won (No). If it's 0, it means the first side won (Yes).
    settledSide: settleFraction === 1 ? 0 : 1,
    settlement,
  };
};
