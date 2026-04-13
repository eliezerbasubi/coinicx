import { ArrowUp } from "lucide-react";

import { CHART_HEIGHT } from "@/lib/constants/chart-options";
import { CandleSnapshotInterval, ChartView } from "@/lib/types/trade";
import { cn } from "@/lib/utils/cn";
import Visibility from "@/components/common/Visibility";
import { Button } from "@/components/ui/button";
import AppLogo from "@/components/vectors/app-logo";
import { useFetchSnapshots } from "@/features/predict/event/hooks/useFetchSnapshots";
import {
  useSeriesChart,
  type SeriesInfo,
} from "@/features/predict/event/hooks/useSeriesChart";
import { useSeriesChartSubs } from "@/features/predict/event/hooks/useSeriesChartSubs";

const MAX_LEGEND_HEIGHT = 62;

type Props = {
  seriesInfo: SeriesInfo[];
  chartView?: ChartView;
  interval: CandleSnapshotInterval;
};

const SeriesChart = ({ seriesInfo, interval, chartView = "line" }: Props) => {
  const minHeight =
    chartView === "line" ? CHART_HEIGHT : CHART_HEIGHT + MAX_LEGEND_HEIGHT;

  const { snapshots, isLoading, isError, refetch } = useFetchSnapshots({
    interval,
    coins: seriesInfo.map((info) => info.coin),
  });

  const { legendRef, containerRef, tooltipRef, updateSeries } = useSeriesChart({
    seriesInfo,
    snapshots,
    chartView,
    interval,
    chartOptions: {
      height: minHeight,
    },
  });

  useSeriesChartSubs({
    coins: seriesInfo.map((info) => info.coin),
    interval,
    onCandleUpdate: updateSeries,
  });

  const hasSnapshots = !!snapshots.length && snapshots.flat().length > 0;

  return (
    <div className="relative size-full" data-vaul-no-drag>
      <Visibility visible={chartView === "line"}>
        <div
          ref={legendRef}
          className="flex items-center min-h-10 px-2 md:px-4 py-2"
        >
          {/* Show legend only for categorical outcomes */}
          <Visibility
            visible={!isError && hasSnapshots && snapshots.length > 1}
          >
            <div className="flex items-start md:items-center flex-col md:flex-row gap-2 md:gap-4">
              {seriesInfo.map((info) => {
                return (
                  <div key={info.coin} className="flex items-center gap-1">
                    <span
                      data-series-marker
                      className="size-2 rounded-full shrink-0"
                    />
                    <span className="text-xs font-medium text-neutral-gray-400 line-clamp-1">
                      {info.title}
                    </span>
                    <span
                      data-chance
                      className="min-w-9 text-xs font-medium lining-nums tabular-nums"
                    />
                  </div>
                );
              })}
            </div>
          </Visibility>

          {/* Show chance and change for binary outcomes */}
          <Visibility
            visible={!isError && hasSnapshots && snapshots.length === 1}
          >
            <div className="space-y-0.5">
              <p
                className={cn("text-primary text-sm font-bold", {
                  "text-sell": seriesInfo[0]?.sideIndex === 1,
                })}
              >
                {seriesInfo[0]?.sideName}
              </p>

              <div className="flex items-center gap-1 transition-[width] duration-200">
                <p
                  className={cn(
                    "text-primary text-base font-bold tabular-nums lining-nums space-x-1",
                    {
                      "text-sell": seriesInfo[0]?.sideIndex === 1,
                    },
                  )}
                >
                  <span
                    data-series-chance
                    className="inline-block min-w-8.5 text-base"
                  >
                    0%
                  </span>
                  <span className="text-sm">Chance</span>
                </p>
                <p
                  data-series-change-container
                  className="flex items-center gap-0.5 text-neutral-gray-400 text-xs font-semibold ml-1"
                >
                  <ArrowUp
                    data-series-change-arrow
                    className="size-3 stroke-3 transition-transform"
                  />
                  <span data-series-change>0%</span>
                </p>
              </div>
            </div>
          </Visibility>

          <div className="ml-auto self-end md:self-auto">
            <AppLogo className="h-5 opacity-40" />
          </div>
        </div>
      </Visibility>

      <div className="flex flex-col" style={{ minHeight }}>
        <Visibility visible={isLoading}>
          <div className="flex-1 flex items-center justify-center size-full">
            <AppLogo className="h-5" />
          </div>
        </Visibility>

        <Visibility visible={isError}>
          <div className="flex-1 flex flex-col items-center justify-center size-full">
            <span className="text-neutral-gray-400 text-sm">
              Failed to load chart data
            </span>
            <Button
              onClick={() => refetch("failed")}
              size="sm"
              variant="outline"
              className="mt-2 w-fit"
            >
              Retry
            </Button>
          </div>
        </Visibility>

        <Visibility visible={!isLoading && !isError && !hasSnapshots}>
          <div className="flex-1 flex items-center justify-center size-full">
            <span className="text-neutral-gray-400 text-sm">
              No chart data available for the selected time interval
            </span>
          </div>
        </Visibility>

        <Visibility visible={hasSnapshots}>
          <div ref={containerRef} className="size-full" />
        </Visibility>
      </div>

      <div
        ref={tooltipRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          opacity: 0,
          pointerEvents: "none",
          zIndex: 10,
          width: 180,
          padding: "8px 10px",
          borderRadius: 8,
          background: "rgba(24, 26, 32, 0.92)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(94, 102, 115, 0.2)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
          transition: "opacity 0.15s ease",
        }}
      />
    </div>
  );
};

export default SeriesChart;
