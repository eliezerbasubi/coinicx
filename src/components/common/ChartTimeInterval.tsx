import React, { useReducer, useRef } from "react";
import { CandleSnapshotParameters } from "@nktkas/hyperliquid";
import { ChevronDown } from "lucide-react";

import {
  useChartSettingsStore,
  useShallowChartSettingsStore,
} from "@/lib/store/trade/chart-settings";
import { cn } from "@/lib/utils/cn";
import AdaptivePopover from "@/components/ui/adaptive-popover";
import { Button } from "@/components/ui/button";

const CHART_INTERVALS: Array<CandleSnapshotParameters["interval"]> = [
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

type Props = {
  className?: string;
};

const ChartTimeInterval = ({ className }: Props) => {
  const { interval: currentInterval, bookmarkIntervals } =
    useShallowChartSettingsStore((s) => ({
      interval: s.interval,
      bookmarkIntervals: s.bookmarkIntervals,
    }));

  const onIntervalChange = (interval: CandleSnapshotParameters["interval"]) => {
    useChartSettingsStore.getState().setSettings({ interval });
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {bookmarkIntervals.map((interval) => {
        return (
          <div
            key={interval}
            role="button"
            tabIndex={0}
            className={cn(
              "text-3xs md:text-xs text-neutral-gray-400 font-medium md:font-semibold cursor-pointer transition-colors",
              {
                "text-white": interval === currentInterval,
              },
            )}
            onClick={() => onIntervalChange(interval)}
          >
            {capitalize(interval)}
          </div>
        );
      })}
      <MoreIntervals />
    </div>
  );
};

export default ChartTimeInterval;

type State = {
  open: boolean;
  pinning: boolean;
  pins: CandleSnapshotParameters["interval"][];
};

const MoreIntervals = () => {
  const { interval: currentInterval, bookmarkIntervals } =
    useShallowChartSettingsStore((s) => ({
      interval: s.interval,
      bookmarkIntervals: s.bookmarkIntervals,
    }));

  const [{ open, pinning, pins }, dispatch] = useReducer(
    (prev: State, next: Partial<State>) => ({ ...prev, ...next }),
    { open: false, pinning: false, pins: bookmarkIntervals },
  );

  const triggerRef = useRef<HTMLDivElement>(null);

  const isNotBookmarked = !bookmarkIntervals.includes(currentInterval);

  const onEditPins = () => {
    if (!pinning) {
      dispatch({ pinning: true });

      return;
    }

    // Reset default pins
    useChartSettingsStore.getState().resetBookmarkIntervals();
  };

  const onSelectPin = (interval: CandleSnapshotParameters["interval"]) => {
    if (!pinning) {
      useChartSettingsStore.getState().setSettings({ interval });
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
    useChartSettingsStore.getState().setSettings({ bookmarkIntervals: pins });
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
          {isNotBookmarked ? capitalize(currentInterval) : "More"}
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
        {CHART_INTERVALS.map((interval) => {
          const isBookmarked = bookmarkIntervals.includes(interval);
          if (isBookmarked && !pinning) return null;

          const isCurrent = interval === currentInterval;
          const isPinned = pins.length > 0 && pins.includes(interval);

          return (
            <Button
              key={interval}
              variant="secondary"
              className={cn(
                "bg-neutral-gray-200 hover:text-white h-8 p-0 text-xs text-neutral-gray-400 font-semibold cursor-pointer transition-colors border border-transparent",
                {
                  "bg-neutral-gray-300 text-white": isCurrent,
                  "border border-primary/10 text-primary bg-neutral-gray-200/10":
                    isPinned,
                },
              )}
              onClick={() => onSelectPin(interval)}
            >
              {capitalize(interval)}
            </Button>
          );
        })}
      </div>

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
    </AdaptivePopover>
  );
};

const capitalize = (s: string) =>
  ["h", "d", "w"].includes(s.charAt(s.length - 1))
    ? s.charAt(0) + s.slice(1).toUpperCase()
    : s;
