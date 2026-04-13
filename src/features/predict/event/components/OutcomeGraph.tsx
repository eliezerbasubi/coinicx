import { useReducer } from "react";
import { CandleSnapshotParameters } from "@nktkas/hyperliquid";

import { useChartSettingsStore } from "@/lib/store/trade/chart-settings";
import {
  TimeIntervalList,
  TimeIntervalPopover,
} from "@/components/common/ChartTimeInterval";
import {
  OpenInterestStat,
  VolumeStat,
} from "@/features/predict/components/MarketEventStats";
import {
  MarketEventMetaOutcome,
  SideSpecCtx,
} from "@/features/predict/lib/types";

import SeriesChart from "./Charts/SeriesChart";
import SwitchOutcomeTooltip from "./SwitchOutcomeTooltip";

type Props = {
  outcomeMeta: MarketEventMetaOutcome;
  sidesCtxs: SideSpecCtx[];
};

type State = {
  sideIndex: number;
  interval: CandleSnapshotParameters["interval"];
};

const OutcomeGraph = ({ outcomeMeta, sidesCtxs }: Props) => {
  // We don't want to subscribe to chart settings changes
  const chartSettings = useChartSettingsStore.getState();
  const interval = chartSettings.interval;
  const bookmarkIntervals = chartSettings.bookmarkIntervals;

  const [state, dispatch] = useReducer(
    (prev: State, next: Partial<State>) => ({ ...prev, ...next }),
    { sideIndex: 0, interval: chartSettings.interval },
  );

  const oppositeSideIndex = state.sideIndex === 0 ? 1 : 0;

  return (
    <div className="w-full min-h-60 overflow-hidden">
      <SeriesChart
        seriesInfo={[
          {
            coin: outcomeMeta.sides[state.sideIndex].coin,
            title: outcomeMeta.title,
            sideName: outcomeMeta.sides[state.sideIndex].name,
            sideIndex: state.sideIndex,
          },
        ]}
        interval={state.interval}
      />

      <div className="w-full flex justify-between flex-wrap-reverse md:flex-nowrap gap-4 md:gap-0 min-h-10 px-0 md:px-4">
        <div className="flex items-center gap-2 divide-x divide-neutral-gray-200">
          <VolumeStat
            value={sidesCtxs[state.sideIndex].volume}
            variant="full"
            showOnEmpty={true}
          />
          <OpenInterestStat
            value={sidesCtxs[state.sideIndex].openInterest}
            variant="full"
            showOnEmpty={true}
          />
        </div>

        <div className="flex items-center flex-1 md:flex-0 justify-end divide-x divide-neutral-gray-200">
          <TimeIntervalList
            items={bookmarkIntervals}
            interval={interval}
            onIntervalChange={(interval) => dispatch({ interval })}
            className="[&>div]:text-xs gap-2.5 pr-2"
          >
            <TimeIntervalPopover
              bookmarkIntervals={bookmarkIntervals}
              interval={interval}
              enablePinning={false}
            />
          </TimeIntervalList>

          <SwitchOutcomeTooltip
            value={outcomeMeta.sides[oppositeSideIndex].name ?? "No"}
            onClick={() => dispatch({ sideIndex: oppositeSideIndex })}
          />
        </div>
      </div>
    </div>
  );
};

export default OutcomeGraph;
