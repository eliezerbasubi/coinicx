import { useChartSettingsStore } from "@/lib/store/trade/chart-settings";
import { ChartTimeInterval } from "@/components/common/ChartTimeInterval";
import Visibility from "@/components/common/Visibility";
import { useMarketEventContext } from "@/features/predict/store/market-event/hooks";

import { useFetchSnapshots } from "../hooks/useFetchSnapshots";
import SeriesCompare from "./charts/SeriesCompare";
import { MarketEventStats } from "./MarketEventStats";
import SwitchOutcomeTooltip from "./SwitchOutcomeTooltip";

const MarketEventChart = () => {
  const { marketEventMeta, chartOutcomeSideIndex, setChartOutcomeSideIndex } =
    useMarketEventContext((s) => ({
      marketEventMeta: s.marketEventMeta,

      // For categorical markets, we don't want to switch outcomes. We just want to show the yes/primary outcome.
      chartOutcomeSideIndex:
        s.marketEventMeta.type === "categorical" ? 0 : s.chartOutcomeSideIndex,
      setChartOutcomeSideIndex: s.setChartOutcomeSideIndex,
    }));

  const interval = useChartSettingsStore((s) => s.interval);

  // We default to the first outcome if there are multiple outcomes
  // To get the current side and opposite side
  const defaultOutcome =
    marketEventMeta.type === "categorical"
      ? marketEventMeta.outcomes[0]
      : marketEventMeta;

  const oppositeSideIndex = chartOutcomeSideIndex === 0 ? 1 : 0;

  const { snapshots, seriesInfo, isLoading, isError } = useFetchSnapshots({
    interval,
    sideIndex: chartOutcomeSideIndex,
    outcomeMetas:
      marketEventMeta.type === "categorical"
        ? marketEventMeta.outcomes
        : [marketEventMeta],
  });

  return (
    <div className="w-full min-h-60 bg-neutral-gray-600 rounded-lg overflow-hidden">
      <SeriesCompare
        isLoading={isLoading}
        isError={isError}
        seriesInfo={seriesInfo}
        snapshots={snapshots}
      />

      <div className="w-full flex justify-between min-h-10 px-4">
        <div className="flex items-center gap-2 divide-x divide-neutral-gray-200">
          <MarketEventStats variant="full" showOnEmpty={true} />
        </div>

        <div className="flex items-center divide-x divide-neutral-gray-200">
          <ChartTimeInterval className="[&>div]:text-xs gap-2.5 pr-2" />

          {/* Only show switch outcome tooltip for non-categorical markets */}
          <Visibility visible={marketEventMeta.type !== "categorical"}>
            <SwitchOutcomeTooltip
              value={defaultOutcome.sides[oppositeSideIndex].name ?? "No"}
              onClick={() => setChartOutcomeSideIndex(oppositeSideIndex)}
            />
          </Visibility>
        </div>
      </div>
    </div>
  );
};

export default MarketEventChart;
