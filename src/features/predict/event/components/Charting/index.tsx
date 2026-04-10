import { useMemo } from "react";
import { CandleSnapshotResponse } from "@nktkas/hyperliquid";
import { useQueries } from "@tanstack/react-query";
import { ArrowLeftRight } from "lucide-react";

import { hlInfoClient } from "@/lib/services/transport";
import { useChartSettingsStore } from "@/lib/store/trade/chart-settings";
import { getChartTimeRange } from "@/lib/utils/intervalFormatter";
import ChartTimeInterval from "@/components/common/ChartTimeInterval";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMarketEventContext } from "@/features/predict/store/market-event/hooks";

import { MarketEventStats } from "../MarketEventStats";
import SeriesCompare from "./charts/SeriesCompare";

const Charting = () => {
  const { marketEventMeta, chartOutcomeSideIndex, setChartOutcomeSideIndex } =
    useMarketEventContext((s) => ({
      marketEventMeta: s.marketEventMeta,
      chartOutcomeSideIndex: s.chartOutcomeSideIndex,
      setChartOutcomeSideIndex: s.setChartOutcomeSideIndex,
    }));

  const interval = useChartSettingsStore((s) => s.interval);

  // We default to the first outcome if there are multiple outcomes
  // To get the current side and opposite side
  const defaultOutcome = marketEventMeta.outcomes.length
    ? marketEventMeta.outcomes[0]
    : marketEventMeta;

  const oppositeSideIndex = chartOutcomeSideIndex === 0 ? 1 : 0;

  /**
   * Build the series info (name + coin) for each outcome to chart.
   */
  const seriesInfo = useMemo(() => {
    if (marketEventMeta.outcomes.length) {
      return marketEventMeta.outcomes.slice(0, 3).map((outcome) => ({
        name: outcome.title,
        coin: outcome.sides[chartOutcomeSideIndex].coin,
        sideName: outcome.sides[chartOutcomeSideIndex].name,
        sideIndex: chartOutcomeSideIndex,
      }));
    }

    return [
      {
        name: marketEventMeta.title,
        coin: marketEventMeta.sides[chartOutcomeSideIndex].coin,
        sideName: marketEventMeta.sides[chartOutcomeSideIndex].name,
        sideIndex: chartOutcomeSideIndex,
      },
    ];
  }, [marketEventMeta.outcomes, chartOutcomeSideIndex]);

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

  return (
    <div className="w-full min-h-60 bg-neutral-gray-600 rounded-lg mt-4 overflow-hidden">
      <SeriesCompare
        isLoading={isLoading}
        isError={isError}
        interval={interval}
        seriesInfo={seriesInfo}
        snapshots={snapshots}
      />

      <div className="w-full flex justify-between min-h-10 px-4">
        <div className="flex items-center gap-2 divide-x divide-neutral-gray-200">
          <MarketEventStats variant="full" showOnEmpty={true} />
        </div>

        <div className="flex items-center divide-x divide-neutral-gray-200">
          <ChartTimeInterval className="[&>div]:text-xs gap-2.5 pr-2" />
          <Tooltip>
            <TooltipTrigger
              className="pl-2"
              onClick={() => setChartOutcomeSideIndex(oppositeSideIndex)}
            >
              <ArrowLeftRight className="size-4 text-neutral-gray-400" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-white">
                Switch to {defaultOutcome.sides[oppositeSideIndex].name ?? "No"}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default Charting;
