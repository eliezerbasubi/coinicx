import { useMemo } from "react";
import { CandleWsEvent } from "@nktkas/hyperliquid";

import { hlSubClient } from "@/lib/services/transport";
import { CandleSnapshotInterval } from "@/lib/types/trade";
import { useSubscriptions } from "@/hooks/useSubscription";

type SeriesChartSubsArgs = {
  interval: CandleSnapshotInterval;
  coins: string[];
  onCandleUpdate: (candle: CandleWsEvent, seriesIndex: number) => void;
  enabled?: boolean;
};

/**
 * Subscribe to realtime candle updates and forward them to the chart.
 */
export const useSeriesChartSubs = ({
  coins,
  interval,
  onCandleUpdate,
  enabled = true,
}: SeriesChartSubsArgs) => {
  const subscribes = useMemo(() => {
    if (!enabled) return [];

    return coins.map(
      (coin, index) => () =>
        hlSubClient.candle({ coin, interval }, (data) => {
          onCandleUpdate(data, index);
        }),
    );
  }, [coins, enabled]);

  useSubscriptions(subscribes, [subscribes]);
};
