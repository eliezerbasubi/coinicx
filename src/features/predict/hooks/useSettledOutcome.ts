import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/lib/constants/queryKeys";
import { hlInfoClient } from "@/lib/services/transport";

import { MarketEventMeta } from "../lib/types";
import { mapOutcomeSpecToMarketEventMeta } from "../lib/utils/mapper";
import { parseSettledOutcomeDetails } from "../lib/utils/parseMetadata";

type UseSettledOutcomeArgs = {
  outcome: number | null;
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

  const query = useQuery({
    queryKey: [QUERY_KEYS.settledOutcome, args.outcome],
    enabled: !!args.outcome && enabled,
    select: mapDataSettledOutcome,
    queryFn: async () => {
      const settledOutcome =
        await hlInfoClient.config_.transport.request<SettleOutcomeSpec>(
          "info",
          {
            type: "settledOutcome",
            outcome: args.outcome,
          },
        );

      return settledOutcome;
    },
  });

  return query;
};

const mapDataSettledOutcome = (data: SettleOutcomeSpec): MarketEventMeta => {
  const marketEvent = mapOutcomeSpecToMarketEventMeta(data.spec);
  const settledDetails = parseSettledOutcomeDetails(data.details);

  const settleFraction = parseInt(data.settleFraction, 10);

  return {
    ...marketEvent,
    status: "settled",
    // If settle fraction is 1, it means the second side won (No). If it's 0, it means the first side won (Yes).
    settledSide: settleFraction === 1 ? 0 : 1,
    settledDetails,
  };
};
