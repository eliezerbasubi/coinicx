import { useOrderFormStore } from "@/lib/store/trade/order-form";
import { cn } from "@/lib/utils/cn";
import { MarketSideButton } from "@/features/predict/components/MarketSideActions";
import { useMarketEventContext } from "@/features/predict/lib/store/market-event/hooks";

type Props = {
  className?: string;
};

const BottomNavActions = ({ className }: Props) => {
  const { marketEventMeta, marketEventCtx } = useMarketEventContext((s) => ({
    marketEventMeta: s.marketEventMeta,
    marketEventCtx: s.marketEventCtx,
  }));

  return (
    <div
      className={cn(
        "fixed bottom-4 inset-x-0 z-10 w-full mx-auto grid grid-cols-2 gap-2 px-4 md:px-6",
        className,
      )}
    >
      {marketEventMeta.sides.map((side, index) => (
        <MarketSideButton
          key={side.coin}
          isCurrent
          side={{ ...side, ...marketEventCtx.sides[index] }}
          index={index}
          label="Buy"
          className="h-11"
          onClick={() => {
            useOrderFormStore.getState().setPredictSideIndex(index);
          }}
        />
      ))}
    </div>
  );
};

export default BottomNavActions;
