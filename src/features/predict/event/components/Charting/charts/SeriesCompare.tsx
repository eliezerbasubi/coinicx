import { CandleSnapshotResponse } from "@nktkas/hyperliquid";
import { ArrowUp } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import Visibility from "@/components/common/Visibility";
import AppLogo from "@/components/vectors/app-logo";

import { useSeriesChart, type SeriesInfo } from "./hooks/useSeriesChart";
import { useSeriesChartSubs } from "./hooks/useSeriesChartSubs";

const SeriesCompare = ({
  seriesInfo,
  snapshots,
  isLoading,
  isError,
}: {
  isLoading: boolean;
  isError: boolean;
  seriesInfo: SeriesInfo[];
  snapshots: Array<CandleSnapshotResponse>;
}) => {
  const { legendRef, containerRef, tooltipRef, updateSeries } = useSeriesChart({
    seriesInfo,
    snapshots,
  });

  useSeriesChartSubs({
    onCandleUpdate: updateSeries,
  });

  return (
    <div className="relative size-full" data-vaul-no-drag>
      <div
        ref={legendRef}
        className="flex items-center gap-x-4 min-h-10 px-4 py-2"
      >
        {/* Show legend only for categorical outcomes */}
        <Visibility visible={snapshots.length > 1}>
          {seriesInfo.map((info) => {
            return (
              <div key={info.coin} className="flex items-center gap-1">
                <span
                  data-series-marker
                  className="size-2 rounded-full shrink-0"
                />
                <span className="text-xs font-medium text-neutral-gray-400 line-clamp-1">
                  {info.name}
                </span>
                <span
                  data-chance
                  className="min-w-9 text-xs font-medium lining-nums tabular-nums"
                />
              </div>
            );
          })}
        </Visibility>

        {/* Show chance and change for binary outcomes */}
        <Visibility visible={snapshots.length === 1}>
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

        <div className="flex-1 flex justify-end">
          <AppLogo className="h-5 opacity-40" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center size-full min-h-60">
          <span className="text-neutral-gray-400 text-sm">Loading chart…</span>
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center size-full min-h-60">
          <span className="text-neutral-gray-400 text-sm">
            Failed to load chart data
          </span>
        </div>
      ) : (
        <div ref={containerRef} className="size-full" />
      )}

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

export default SeriesCompare;
