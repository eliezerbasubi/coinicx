import { useMemo } from "react";
import {
  CandleSnapshotParameters,
  CandleSnapshotResponse,
} from "@nktkas/hyperliquid";
import { useQueries } from "@tanstack/react-query";

import { hlInfoClient } from "@/lib/services/transport";
import { getChartTimeRange } from "@/lib/utils/intervalFormatter";
import { MarketEventMetaSide } from "@/features/predict/types";

type UseFetchSnapshotsArgs = {
  outcomeMetas: { title: string; sides: MarketEventMetaSide[] }[];
  interval: CandleSnapshotParameters["interval"];
  sideIndex: number;
};

export const useFetchSnapshots = ({
  outcomeMetas,
  interval,
  sideIndex,
}: UseFetchSnapshotsArgs) => {
  /**
   * Build the series info (name + coin) for each outcome to chart.
   */
  const seriesInfo = useMemo(() => {
    return outcomeMetas.map((meta) => ({
      name: meta.title,
      coin: meta.sides[sideIndex].coin,
      sideName: meta.sides[sideIndex].name,
      sideIndex,
    }));
  }, [outcomeMetas, sideIndex]);

  /**
   * Fetch candle snapshots for each outcome.
   */
  const {
    data: snapshots,
    isLoading,
    isError,
  } = useQueries({
    combine(results) {
      return {
        data: results.map(
          (result) => result.data,
        ) as Array<CandleSnapshotResponse>,
        isLoading: results.some((result) => result.isLoading),
        isError: results.some((result) => result.isError),
      };
    },
    queries: seriesInfo.map((info) => ({
      queryKey: ["asset-candle-snapshot", info.coin, interval],
      queryFn: () => {
        const timeRange = getChartTimeRange(interval);

        return hlInfoClient.candleSnapshot({
          coin: info.coin,
          interval,
          startTime: timeRange.startTime,
        });
      },
    })),
  });

  return {
    snapshots,
    seriesInfo,
    isLoading,
    isError,
  };
};
