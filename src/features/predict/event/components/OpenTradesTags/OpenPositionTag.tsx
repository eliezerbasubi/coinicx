import { X } from "lucide-react";

import { useOrderFormStore } from "@/lib/store/trade/order-form";
import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import { useIsLaptop } from "@/hooks/useIsMobile";
import { Button } from "@/components/ui/button";
import Tag from "@/components/ui/tag";
import { useMarketEventContext } from "@/features/predict/lib/store/market-event/hooks";
import { parsePriceToFormat } from "@/features/trade/utils";

type Props = {
  position: {
    sideIndex: number;
    sideName: string;
    entryPx: number;
    shares: number;
  };
  activeOutcomeIndex?: number;
};

const OpenPositionTag = ({ position, activeOutcomeIndex }: Props) => {
  const isLaptop = useIsLaptop();

  const { setActiveOutcomeIndex, getState, openTradingWidgetDrawer } =
    useMarketEventContext((s) => ({
      setActiveOutcomeIndex: s.setActiveOutcomeIndex,
      getState: s.getState,
      openTradingWidgetDrawer: s.openTradingWidgetDrawer,
    }));

  return (
    <Tag
      className={cn(
        "text-buy bg-buy/10 space-x-0.5 flex items-center group/position",
        {
          "text-sell bg-sell/10": position.sideIndex === 1,
        },
      )}
      onClick={(e) => {
        e.stopPropagation();

        const { marketEventCtx, activeOutcomeIndex: outcomeIndex } = getState();

        const activeOutcomeIdx =
          typeof activeOutcomeIndex === "number"
            ? activeOutcomeIndex
            : outcomeIndex;

        const sidesCtx =
          marketEventCtx.outcomes[activeOutcomeIdx].sides ??
          marketEventCtx.sides;

        const mid =
          sidesCtx[position.sideIndex].midPx ||
          sidesCtx[position.sideIndex].markPx;

        const orderFormState = useOrderFormStore.getState();

        orderFormState.setOrderSide("sell");
        orderFormState.setPredictSideIndex(position.sideIndex);

        // Set isSzInNtl to false because we are setting size to shares which is not in notional
        orderFormState.setSettings({ isSzInNtl: false });

        if (typeof activeOutcomeIndex === "number") {
          setActiveOutcomeIndex(activeOutcomeIndex);
        } else {
          orderFormState.setExecutionOrder({
            size: position.shares.toString(),
            limitPrice: parsePriceToFormat(mid, "toCents").toFixed(1),
          });
        }

        // open trading widget drawer only on mobile
        if (!isLaptop) {
          openTradingWidgetDrawer(true, { resetOnMount: false });
        }
      }}
    >
      <div className="flex-1 space-x-1">
        <span>{formatNumber(position.shares)}</span>
        <span>{position.sideName}</span>
        <span>• {formatNumber(position.entryPx, { style: "cent" })}</span>
      </div>

      <Button
        asChild
        size="sm"
        variant="ghost"
        className="p-0! size-fit block lg:hidden group-hover/position:block"
      >
        <X className="size-3! stroke-2" />
      </Button>
    </Tag>
  );
};

export default OpenPositionTag;
