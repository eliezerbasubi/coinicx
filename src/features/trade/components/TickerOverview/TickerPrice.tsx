import { useTradeContext } from "@/lib/store/trade/hooks";
import { useShallowInstrumentStore } from "@/lib/store/trade/instrument";
import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import { useIsMobile } from "@/hooks/useIsMobile";
import Visibility from "@/components/common/Visibility";
import { formatPriceToDecimal } from "@/features/trade/utils";

const TickerPrice = () => {
  const isMobile = useIsMobile();

  const { decimals, isSpot } = useTradeContext((s) => ({
    decimals: s.decimals,
    isSpot: s.instrumentType === "spot",
  }));

  const tokenCtx = useShallowInstrumentStore((s) => ({
    markPx: s.assetCtx?.markPx ?? 0,
    midPx: s.assetCtx?.midPx ?? 0,
    prevDayPx: s.assetCtx?.prevDayPx ?? 0,
  }));

  const price = tokenCtx.midPx || tokenCtx.markPx;

  const change = tokenCtx.markPx - tokenCtx.prevDayPx;
  const changeInPercentage = (change / tokenCtx.prevDayPx) * 100;

  return (
    <div className="flex-1 md:flex-none">
      <div className="flex-1">
        <Visibility visible={isMobile}>
          <p className="text-2xs text-neutral-gray-400 font-medium mt-0.5">
            Last Price
          </p>
        </Visibility>
        <p
          className={cn("text-xl text-buy font-bold", {
            "text-sell": tokenCtx.markPx > tokenCtx.prevDayPx,
          })}
        >
          {formatPriceToDecimal(price, decimals, {
            useFallback: true,
          })}
        </p>

        {/* Price dollar value conversion */}
        <p className="text-xs font-semibold">
          <span>
            {formatNumber(price, {
              style: "currency",
              useFallback: true,
            })}
          </span>

          <Visibility visible={isMobile}>
            <span
              className={cn("text-xs text-buy ml-1", {
                "text-sell": changeInPercentage < 0,
              })}
            >
              {formatNumber(changeInPercentage / 100, {
                style: "percent",
                useFallback: true,
                useSign: true,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </Visibility>
        </p>
      </div>

      <Visibility visible={isMobile && !isSpot}>
        <div className="flex items-center gap-x-1 font-medium mt-0.5">
          <p className="text-2xs text-neutral-gray-400">Mark Price</p>

          <p className="text-2xs">
            {formatPriceToDecimal(tokenCtx.markPx, decimals, {
              useFallback: true,
            })}
          </p>
        </div>
      </Visibility>
    </div>
  );
};

export default TickerPrice;
