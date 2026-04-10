import { useMemo } from "react";
import { CandleWsEvent } from "@nktkas/hyperliquid";

import { hlSubClient } from "@/lib/services/transport";
import { useShallowChartSettingsStore } from "@/lib/store/trade/chart-settings";
import { useSubscriptions } from "@/hooks/useSubscription";
import { useMarketEventContext } from "@/features/predict/lib/store/market-event/hooks";

type SeriesChartSubsArgs = {
  onCandleUpdate: (candle: CandleWsEvent, seriesIndex: number) => void;
};

/**
 * Subscribe to realtime candle updates and forward them to the chart.
 */
export const useSeriesChartSubs = ({ onCandleUpdate }: SeriesChartSubsArgs) => {
  const { marketEventMeta, chartOutcomeSideIndex } = useMarketEventContext(
    (s) => ({
      marketEventMeta: s.marketEventMeta,
      chartOutcomeSideIndex: s.chartOutcomeSideIndex,
    }),
  );

  const interval = useShallowChartSettingsStore((s) => s.interval);

  const subscribes = useMemo(() => {
    if (marketEventMeta.outcomes.length) {
      return marketEventMeta.outcomes.slice(0, 3).map(
        (outcome, index) => () =>
          hlSubClient.candle(
            { coin: outcome.sides[chartOutcomeSideIndex].coin, interval },
            (data) => {
              onCandleUpdate(data, index);
            },
          ),
      );
    }

    return [
      () =>
        hlSubClient.candle(
          {
            coin: marketEventMeta.sides[chartOutcomeSideIndex].coin,
            interval,
          },
          (data) => {
            onCandleUpdate(data, 0);
          },
        ),
    ];
  }, [interval, chartOutcomeSideIndex]);

  useSubscriptions(subscribes, [subscribes]);
};
