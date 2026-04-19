import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import { useIsMobile } from "@/hooks/useIsMobile";
import Visibility from "@/components/common/Visibility";
import { useTradeContext } from "@/features/trade/store/hooks";
import { formatPriceToDecimal } from "@/features/trade/utils";

const TickerPrice = () => {
  const isMobile = useIsMobile();

  const { pxDecimals, isSpot, markPx, midPx, prevDayPx } = useTradeContext(
    (s) => ({
      pxDecimals: s.assetMeta.pxDecimals,
      isSpot: s.instrumentType === "spot",
      markPx: s.assetCtx.markPx,
      midPx: s.assetCtx.midPx,
      prevDayPx: s.assetCtx.prevDayPx,
    }),
  );

  const price = midPx || markPx;

  const change = markPx - prevDayPx;
  const changeInPercentage = (change / prevDayPx) * 100;

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
            "text-sell": markPx > prevDayPx,
          })}
        >
          {formatPriceToDecimal(price, pxDecimals, {
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
            {formatPriceToDecimal(markPx, pxDecimals, {
              useFallback: true,
            })}
          </p>
        </div>
      </Visibility>
    </div>
  );
};

export default TickerPrice;
