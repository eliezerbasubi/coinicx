import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import { useIsMobile } from "@/hooks/useIsMobile";
import Visibility from "@/components/common/Visibility";
import AdaptiveTooltip from "@/components/ui/adaptive-tooltip";
import { useTradeContext } from "@/features/trade/store/hooks";

import FundingCountdown from "./FundingCountdown";

const TickerContexts = () => {
  const isMobile = useIsMobile();

  const { base, quote, instrumentType, pxDecimals, assetCtx } = useTradeContext(
    (state) => ({
      base: state.assetMeta.base,
      quote: state.assetMeta.quote,
      instrumentType: state.instrumentType,
      pxDecimals: state.assetMeta.pxDecimals,
      assetCtx: state.assetCtx,
    }),
  );

  const prevDayPx = assetCtx.prevDayPx;
  const markPx = assetCtx.markPx;

  const change = markPx - prevDayPx;
  const changeInPercentage = (change / prevDayPx) * 100;

  const isSpot = instrumentType === "spot";

  const formatBigValue = (
    value?: string | number,
    options?: Intl.NumberFormatOptions,
  ) => {
    return formatNumber(Number(value), {
      useFallback: true,
      notation: isMobile && Number(value) >= 1e6 ? "compact" : undefined,
      minimumFractionDigits: pxDecimals ?? 0,
      maximumFractionDigits: pxDecimals ?? 10,
      ...options,
    });
  };

  return (
    <div className="grid grid-cols-2 self-end md:self-auto md:flex items-center gap-2 md:gap-4 md:overflow-x-auto no-scrollbars">
      <Visibility visible={!isMobile && !isSpot}>
        <TickerItem
          label="Oracle Price"
          value={formatBigValue(assetCtx?.oraclePx ?? 0)}
        />
      </Visibility>
      <Visibility visible={!isMobile}>
        <TickerItem
          label="24H Change"
          value={formatBigValue(change)}
          suffix={
            <p>
              {formatNumber(changeInPercentage / 100, {
                style: "percent",
                useFallback: true,
                useSign: true,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          }
          className={cn("text-buy", {
            "text-sell": changeInPercentage < 0,
          })}
        />
      </Visibility>

      {/* Hide base 2h vol on mobile for perps */}
      <Visibility visible={!isMobile || isSpot}>
        <TickerItem
          label={isMobile ? `24H Vol(${base})` : `24H Volume(${base})`}
          value={formatBigValue(assetCtx?.dayBaseVlm, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        />
      </Visibility>
      <TickerItem
        label={isMobile ? `24H Vol(${quote})` : `24H Volume(${quote})`}
        value={formatBigValue(assetCtx?.dayNtlVlm, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      />

      <Visibility visible={!isSpot}>
        <TickerItem
          label="Open Interest"
          value={formatBigValue((assetCtx?.openInterest ?? 0) * markPx, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        />
        <TickerItem
          wrapperClassName="col-span-2"
          label={
            <AdaptiveTooltip
              variant="underline"
              title="Funding Rate"
              trigger={
                <p className="space-x-0.5">
                  <span>Funding Rate</span>
                  <span>/</span>
                  <span>Countdown</span>
                </p>
              }
            >
              <p>
                Funding rate is the interest rate paid between long and short
                positions in a perpetual futures contract.
              </p>
            </AdaptiveTooltip>
          }
          value={
            <span className="flex items-center gap-1">
              <span
                className={cn("text-buy", {
                  "text-sell": Number(assetCtx?.funding ?? 0) < 0,
                })}
              >
                {formatNumber(assetCtx?.funding ?? 0, {
                  style: "percent",
                  useFallback: true,
                  minimumFractionDigits: 4,
                  maximumFractionDigits: 4,
                })}
              </span>
              <span>/</span>
              <FundingCountdown />
            </span>
          }
        />
      </Visibility>
      <Visibility visible={instrumentType === "spot"}>
        <TickerItem
          label="Market Cap"
          value={formatBigValue(Number(assetCtx?.marketCap ?? 0), {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        />
      </Visibility>
    </div>
  );
};

type TickerItemProps = {
  label: React.ReactNode;
  value?: React.ReactNode;
  suffix?: React.ReactNode;
  className?: string;
  wrapperClassName?: string;
};

const TickerItem = ({
  label,
  value,
  className,
  suffix,
  wrapperClassName,
}: TickerItemProps) => {
  return (
    <div className={cn("w-fit", wrapperClassName)}>
      <div className="text-neutral-gray-400 text-2xs md:text-xs md:pb-0.5 md:mb-1 md:whitespace-nowrap">
        {label}
      </div>

      <div
        className={cn(
          "flex items-center text-3xs md:text-xs font-medium space-x-1 lining-nums tabular-nums",
          className,
        )}
      >
        <p>{value}</p>

        {suffix}
      </div>
    </div>
  );
};

export default TickerContexts;
