import React from "react";

import { formatNumber } from "@/lib/utils/formatting/numbers";
import { useMarketEventContext } from "@/features/predict/lib/store/market-event/hooks";

type Props = {
  variant: "compact" | "full";
  /**
   * Show the stat even if the value is 0
   */
  showOnEmpty?: boolean;
};

type StatProps = {
  value: number;
  label: string;
} & Props;

const Stat = ({ variant, showOnEmpty, value, label }: StatProps) => {
  if (!value && !showOnEmpty) return null;

  return (
    <p className="text-xs font-medium text-neutral-gray-400 pr-2">
      <span>
        {formatNumber(value, {
          style: "currency",
          notation: variant === "compact" ? "compact" : "standard",
        })}
      </span>
      <span className="ml-1">{label}</span>
    </p>
  );
};

export const VolumeStat = ({
  variant,
  value,
  showOnEmpty,
}: Omit<StatProps, "label">) => {
  return (
    <Stat
      variant={variant}
      value={value}
      label="Vol"
      showOnEmpty={showOnEmpty}
    />
  );
};

export const OpenInterestStat = ({
  variant,
  value,
  showOnEmpty,
}: Omit<StatProps, "label">) => {
  return (
    <Stat
      variant={variant}
      value={value}
      label="OI"
      showOnEmpty={showOnEmpty}
    />
  );
};

export const MarketEventStats = ({ variant, showOnEmpty }: Props) => {
  const { openInterest, volume } = useMarketEventContext((s) => ({
    openInterest: s.marketEventCtx.openInterest,
    volume: s.marketEventCtx.volume,
  }));

  return (
    <React.Fragment>
      <VolumeStat variant={variant} value={volume} showOnEmpty={showOnEmpty} />
      <OpenInterestStat
        variant={variant}
        value={openInterest}
        showOnEmpty={showOnEmpty}
      />
    </React.Fragment>
  );
};
