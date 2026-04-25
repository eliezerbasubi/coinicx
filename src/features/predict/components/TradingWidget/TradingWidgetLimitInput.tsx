import {
  useOrderFormStore,
  useShallowOrderFormStore,
} from "@/lib/store/trade/order-form";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { InputNumberControl } from "@/components/ui/input-number";
import { useMarketEventContext } from "@/features/predict/lib/store/market-event/hooks";

const TradingWidgetLimitInput = () => {
  const { orderType, limitPrice, predictSideIndex } = useShallowOrderFormStore(
    (s) => ({
      orderType: s.settings.orderType,
      triggerPrice: s.triggerPrice,
      limitPrice: s.limitPrice,
      predictSideIndex: s.predictSideIndex,
    }),
  );

  const marketEventCtxSides = useMarketEventContext(
    (s) =>
      s.marketEventCtx.outcomes[s.activeOutcomeIndex]?.sides ??
      s.marketEventCtx.sides,
  );

  const onValueChange = (value: string) => {
    const floatVal = parseFloat(value);

    if (floatVal > 99.9 || floatVal < 0) return;

    useOrderFormStore.getState().setExecutionOrder({
      limitPrice: value,
    });
  };

  if (orderType !== "limit") return null;

  return (
    <div className="w-full border-b border-neutral-gray-200 pb-4 mb-4">
      <InputNumberControl
        name="limitPrice"
        label="Limit Price"
        placeholder="0.0¢"
        wrapperClassName="pr-1 gap-x-0"
        className="placeholder:pr-0.5"
        inputMode="decimal"
        value={limitPrice}
        onValueChange={onValueChange}
        onKeyDown={(e) => {
          let currentPrice = Number(limitPrice) || 0;
          if (e.key === "ArrowUp") {
            e.preventDefault();
            if (currentPrice < 99.9) {
              currentPrice += 0.1;
              onValueChange(currentPrice.toFixed(1));
            }
          }
          if (e.key === "ArrowDown") {
            e.preventDefault();
            if (currentPrice > 0) {
              currentPrice -= 0.1;
              onValueChange(currentPrice.toFixed(1));
            }
          }
        }}
        trailing={
          <div className="flex items-center gap-1">
            <span className={cn("font-medium", { hidden: !limitPrice })}>
              ¢
            </span>
            <Button
              type="button"
              variant="ghost"
              className="w-6 h-5 md:size-6 bg-neutral-gray-200 text-neutral-300 hover:text-primary hover:bg-primary/10 text-3xs md:text-xs font-medium md:font-semibold rounded md:rounded-md"
              onClick={() => {
                const ctx = marketEventCtxSides[predictSideIndex];
                const mid = ctx.midPx || ctx.markPx;

                useOrderFormStore.getState().onMidClick(mid * 100);
              }}
            >
              Mid
            </Button>
          </div>
        }
      />
    </div>
  );
};

export default TradingWidgetLimitInput;
