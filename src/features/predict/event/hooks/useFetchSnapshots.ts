import {
  CandleSnapshotParameters,
  CandleSnapshotResponse,
} from "@nktkas/hyperliquid";
import { useQueries } from "@tanstack/react-query";

import { hlInfoClient } from "@/lib/services/transport";
import { getChartTimeRange } from "@/lib/utils/intervalFormatter";

type UseFetchSnapshotsArgs = {
  coins: string[];
  interval: CandleSnapshotParameters["interval"];
};

export const useFetchSnapshots = ({
  coins,
  interval,
}: UseFetchSnapshotsArgs) => {
  /**
   * Fetch candle snapshots for each outcome.
   */
  const {
    data: snapshots,
    isLoading,
    isError,
    refetch,
  } = useQueries({
    combine(results) {
      return {
        data: results.map(
          (result) => result.data,
        ) as Array<CandleSnapshotResponse>,
        isLoading: results.some((result) => result.isLoading),
        isError: results.some((result) => result.isError),
        refetch: (type: "all" | "failed" = "all") => {
          results.forEach((result) => {
            if (type === "all" || (type === "failed" && result.isError)) {
              result.refetch();
            }
          });
        },
      };
    },
    queries: coins.map((coin) => ({
      queryKey: ["asset-candle-snapshot", coin, interval],
      queryFn: () => {
        const timeRange = getChartTimeRange(interval);

        return hlInfoClient.candleSnapshot({
          coin,
          interval,
          startTime: timeRange.startTime,
        });
      },
    })),
  });

  return {
    snapshots,
    isLoading,
    isError,
    refetch,
  };
};
