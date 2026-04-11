import { useMemo } from "react";
import { ChartCandlestick, ChartLine } from "lucide-react";

import { useShallowChartSettingsStore } from "@/lib/store/trade/chart-settings";
import { CandleSnapshotInterval } from "@/lib/types/trade";
import { cn } from "@/lib/utils/cn";
import { ChartTimeInterval } from "@/components/common/ChartTimeInterval";
import Visibility from "@/components/common/Visibility";
import { Button } from "@/components/ui/button";
import { useSpotAssetMeta } from "@/features/predict/hooks/useSpotMetas";
import { useMarketEventContext } from "@/features/predict/lib/store/market-event/hooks";

import SeriesChart from "./charts/SeriesCompare";
import LiveMarketDetails from "./LiveMarketDetails";
import { MarketEventStats } from "./MarketEventStats";
import SwitchOutcomeTooltip from "./SwitchOutcomeTooltip";

const CHART_VIEWS = [
  { label: "Line", value: "line", icon: ChartLine },
  { label: "Candlestick", value: "candlestick", icon: ChartCandlestick },
] as const;

const MarketEventChart = () => {
  const { marketEventMeta, chartOutcomeSideIndex, setChartOutcomeSideIndex } =
    useMarketEventContext((s) => ({
      marketEventMeta: s.marketEventMeta,

      // For categorical markets, we don't want to switch outcomes. We just want to show the yes/primary outcome.
      chartOutcomeSideIndex:
        s.marketEventMeta.type === "categorical" ? 0 : s.chartOutcomeSideIndex,
      setChartOutcomeSideIndex: s.setChartOutcomeSideIndex,
    }));

  const {
    interval: chartSettingsInterval,
    chartView,
    setSettings,
  } = useShallowChartSettingsStore((s) => ({
    interval: s.interval,
    chartView: s.chartView,
    setSettings: s.setSettings,
  }));

  const spotAssetMeta = useSpotAssetMeta({
    assetName: marketEventMeta.recurringPayload?.underlying ?? null,
  });

  // For recurring markets, we want to show the chart with the period of the market event
  const interval =
    marketEventMeta.type === "recurring" && marketEventMeta.recurringPayload
      ? (marketEventMeta.recurringPayload.period as CandleSnapshotInterval)
      : chartSettingsInterval;

  // We default to the first outcome if there are multiple outcomes
  // To get the current side and opposite side
  const defaultOutcome =
    marketEventMeta.type === "categorical"
      ? marketEventMeta.outcomes[0]
      : marketEventMeta;

  const oppositeSideIndex = chartOutcomeSideIndex === 0 ? 1 : 0;

  // Outcome to fetch snapshots for
  const outcomes =
    marketEventMeta.type === "categorical"
      ? marketEventMeta.outcomes
      : [marketEventMeta];

  // Coin meta to fetch snapshots for
  const seriesInfo = useMemo(() => {
    if (chartView === "candlestick" && spotAssetMeta) {
      return [
        {
          coin: spotAssetMeta.universe.name,
          title: spotAssetMeta.universe.name,
          sideIndex: 0,
          sideName: "",
        },
      ];
    }

    return outcomes.map((outcome) => ({
      coin: outcome.sides[chartOutcomeSideIndex].coin,
      title: outcome.title,
      sideName: outcome.sides[chartOutcomeSideIndex].name,
      sideIndex: chartOutcomeSideIndex,
    }));
  }, [chartView, spotAssetMeta, outcomes, chartOutcomeSideIndex]);

  return (
    <div className="w-full">
      <Visibility visible={marketEventMeta.type === "recurring"}>
        <LiveMarketDetails />
      </Visibility>

      <div className="w-full min-h-60 bg-neutral-gray-600 rounded-lg overflow-hidden">
        <SeriesChart
          seriesInfo={seriesInfo}
          chartView={chartView}
          interval={interval}
        />

        <div className="w-full flex justify-between min-h-10 px-4">
          <div className="flex items-center gap-2 divide-x divide-neutral-gray-200">
            <MarketEventStats variant="full" showOnEmpty={true} />
          </div>

          <div className="flex items-center divide-x divide-neutral-gray-200">
            <Visibility visible={marketEventMeta.type !== "recurring"}>
              <ChartTimeInterval className="[&>div]:text-xs gap-2.5 pr-2" />

              {/* Only show switch outcome tooltip for non-categorical markets */}
              <Visibility visible={marketEventMeta.type !== "categorical"}>
                <SwitchOutcomeTooltip
                  value={defaultOutcome.sides[oppositeSideIndex].name ?? "No"}
                  onClick={() => setChartOutcomeSideIndex(oppositeSideIndex)}
                />
              </Visibility>
            </Visibility>

            <Visibility visible={marketEventMeta.type === "recurring"}>
              <div className="h-8 flex items-center gap-1 border border-neutral-gray-200 rounded-lg p-1">
                {CHART_VIEWS.map((view) => (
                  <Button
                    key={view.value}
                    variant="ghost"
                    size="sm"
                    className={cn("w-fit h-6.5 transition-colors", {
                      "bg-primary/10 text-primary": chartView === view.value,
                    })}
                    onClick={() => setSettings({ chartView: view.value })}
                  >
                    <view.icon className="w-4 h-4" />
                  </Button>
                ))}
              </div>
            </Visibility>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketEventChart;
