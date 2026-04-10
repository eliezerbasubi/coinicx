import React from "react";

import { formatNumber } from "@/lib/utils/formatting/numbers";
import { useMarketEventContext } from "@/features/predict/store/market-event/hooks";

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

export const VolumeStat = ({ variant, showOnEmpty }: Props) => {
  const volume = useMarketEventContext((s) => s.marketEventCtx.volume);

  return (
    <Stat
      variant={variant}
      value={volume}
      label="Vol"
      showOnEmpty={showOnEmpty}
    />
  );
};

export const OpenInterestStat = ({ variant, showOnEmpty }: Props) => {
  const openInterest = useMarketEventContext(
    (s) => s.marketEventCtx.openInterest,
  );

  return (
    <Stat
      variant={variant}
      value={openInterest}
      label="OI"
      showOnEmpty={showOnEmpty}
    />
  );
};

export const MarketEventStats = ({ variant, showOnEmpty }: Props) => {
  return (
    <React.Fragment>
      <VolumeStat variant={variant} showOnEmpty={showOnEmpty} />
      <OpenInterestStat variant={variant} showOnEmpty={showOnEmpty} />
    </React.Fragment>
  );
};
