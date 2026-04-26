import { useReducer, useRef } from "react";
import { ChevronDown } from "lucide-react";

import {
  useChartSettingsStore,
  useShallowChartSettingsStore,
} from "@/lib/store/trade/chart-settings";
import { CandleSnapshotInterval } from "@/lib/types/trade";
import { cn } from "@/lib/utils/cn";
import AdaptivePopover from "@/components/ui/adaptive-popover";
import { Button } from "@/components/ui/button";

import Visibility from "./Visibility";

const CHART_INTERVALS: CandleSnapshotInterval[] = [
  "1m",
  "3m",
  "5m",
  "15m",
  "30m",
  "1h",
  "2h",
  "4h",
  "8h",
  "12h",
  "1d",
  "3d",
  "1w",
  "1M",
];

type TimeIntervalListProps = {
  className?: string;
  interval?: CandleSnapshotInterval;
  items: CandleSnapshotInterval[];
  children?: React.ReactNode;
  onIntervalChange?: (interval: CandleSnapshotInterval) => void;
};

export const TimeIntervalList = ({
  className,
  items,
  interval,
  children,
  onIntervalChange,
}: TimeIntervalListProps) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {items.map((item) => {
        return (
          <div
            key={item}
            role="button"
            tabIndex={0}
            className={cn(
              "text-3xs md:text-xs text-neutral-gray-400 font-medium md:font-semibold cursor-pointer transition-colors",
              {
                "text-white": item === interval,
              },
            )}
            onClick={() => onIntervalChange?.(item)}
          >
            {capitalize(item)}
          </div>
        );
      })}
      {children}
    </div>
  );
};

type TimeIntervalPopoverProps = {
  bookmarkIntervals: CandleSnapshotInterval[];
  interval: CandleSnapshotInterval;
  enablePinning?: boolean;
  onPin?: (interval: CandleSnapshotInterval) => void;
  onConfirm?: (pins: CandleSnapshotInterval[]) => void;
  onReset?: () => void;
};
type State = {
  open: boolean;
  pinning: boolean;
  pins: CandleSnapshotInterval[];
};

export const TimeIntervalPopover = ({
  bookmarkIntervals,
  interval,
  onPin,
  onConfirm,
  onReset,
  enablePinning = true,
}: TimeIntervalPopoverProps) => {
  const [{ open, pinning, pins }, dispatch] = useReducer(
    (prev: State, next: Partial<State>) => ({ ...prev, ...next }),
    { open: false, pinning: false, pins: bookmarkIntervals },
  );

  const triggerRef = useRef<HTMLDivElement>(null);

  const isNotBookmarked = !bookmarkIntervals.includes(interval);

  const onEditPins = () => {
    if (!pinning) {
      dispatch({ pinning: true });

      return;
    }

    // Reset default pins
    onReset?.();
  };

  const onSelectPin = (interval: CandleSnapshotInterval) => {
    if (!pinning) {
      onPin?.(interval);

      dispatch({ open: false });
    } else {
      // Toggle pin
      if (pins.includes(interval)) {
        dispatch({ pins: pins.filter((pin) => pin !== interval) });
      } else {
        dispatch({ pins: [...pins, interval] });
      }
    }
  };

  const onConfirmPins = () => {
    onConfirm?.(pins);

    dispatch({ pinning: false, open: false });
  };

  return (
    <AdaptivePopover
      trigger={
        <div
          ref={triggerRef}
          role="button"
          tabIndex={0}
          className={cn(
            "flex items-center text-3xs md:text-xs text-neutral-gray-400 font-semibold cursor-pointer transition-colors",
            {
              "text-white": isNotBookmarked,
            },
          )}
          onClick={() => dispatch({ open: !open })}
        >
          {isNotBookmarked ? capitalize(interval) : "More"}
          <ChevronDown
            strokeWidth={2.5}
            className={cn("transition-transform size-3 md:size-4", {
              "rotate-180": open,
            })}
          />
        </div>
      }
      open={open}
      onOpenChange={(open) => dispatch({ open, pinning: false })}
      className="md:mt-3 md:p-2"
    >
      <div className="grid grid-cols-5 gap-2 mt-3 md:mt-0">
        {CHART_INTERVALS.map((chartInterval) => {
          const isBookmarked = bookmarkIntervals.includes(chartInterval);
          if (isBookmarked && !pinning) return null;

          const isCurrent = chartInterval === interval;
          const isPinned = pins.length > 0 && pins.includes(chartInterval);

          return (
            <Button
              key={chartInterval}
              variant="secondary"
              className={cn(
                "bg-neutral-gray-200 hover:text-white h-8 p-0 text-xs text-neutral-gray-400 font-semibold cursor-pointer transition-colors border border-transparent",
                {
                  "bg-neutral-gray-300 text-white": isCurrent,
                  "border border-primary/10 text-primary bg-neutral-gray-200/10":
                    isPinned,
                },
              )}
              onClick={() => onSelectPin(chartInterval)}
            >
              {capitalize(chartInterval)}
            </Button>
          );
        })}
      </div>

      <Visibility visible={enablePinning}>
        <div
          className={cn("w-full mt-3 grid gap-x-2", { "grid-cols-2": pinning })}
        >
          <Button
            size="sm"
            variant="outline"
            className={cn("border-neutral-gray-200 text-xs font-semibold", {
              "border-primary text-primary text-sm": pinning,
            })}
            onClick={onEditPins}
          >
            {pinning ? "Reset" : "Pin Intervals"}
          </Button>

          {pinning && (
            <Button
              size="sm"
              variant="default"
              className="text-sm font-semibold"
              onClick={onConfirmPins}
            >
              Confirm
            </Button>
          )}
        </div>
      </Visibility>
    </AdaptivePopover>
  );
};

type Props = {
  className?: string;
};

export const ChartTimeInterval = ({ className }: Props) => {
  const { interval, bookmarkIntervals } = useShallowChartSettingsStore((s) => ({
    interval: s.interval,
    bookmarkIntervals: s.bookmarkIntervals,
  }));

  return (
    <TimeIntervalList
      items={bookmarkIntervals}
      interval={interval}
      onIntervalChange={(interval) =>
        useChartSettingsStore.getState().setSettings({ interval })
      }
      className={className}
    >
      <TimeIntervalPopover
        bookmarkIntervals={bookmarkIntervals}
        interval={interval}
        onPin={(interval) =>
          useChartSettingsStore.getState().setSettings({ interval })
        }
        onConfirm={(pins) =>
          useChartSettingsStore
            .getState()
            .setSettings({ bookmarkIntervals: pins })
        }
        onReset={() =>
          useChartSettingsStore.getState().resetBookmarkIntervals()
        }
      />
    </TimeIntervalList>
  );
};

const capitalize = (s: string) =>
  ["h", "d", "w"].includes(s.charAt(s.length - 1))
    ? s.charAt(0) + s.slice(1).toUpperCase()
    : s;
