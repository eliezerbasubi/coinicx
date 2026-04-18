import {
  useOrderFormStore,
  useShallowOrderFormStore,
} from "@/lib/store/trade/order-form";
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

  const onValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    useOrderFormStore.getState().setExecutionOrder({
      [e.target.name]: e.target.value,
    });
  };

  if (orderType !== "limit") return null;

  return (
    <div className="w-full border-b border-neutral-gray-200 pb-4 mb-4">
      <InputNumberControl
        name="limitPrice"
        label="Limit Price"
        placeholder="0.00"
        wrapperClassName="pr-1"
        value={limitPrice}
        onChange={onValueChange}
        trailing={
          <Button
            type="button"
            variant="ghost"
            className="w-6 h-5 md:size-6 bg-neutral-gray-200 text-neutral-300 hover:text-primary hover:bg-primary/10 text-3xs md:text-xs font-medium md:font-semibold rounded md:rounded-md"
            onClick={() => {
              const midPx = marketEventCtxSides[predictSideIndex].midPx;
              useOrderFormStore.getState().onMidClick(midPx);
            }}
          >
            Mid
          </Button>
        }
      />
    </div>
  );
};

export default TradingWidgetLimitInput;
