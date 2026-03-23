import {
  useOrderFormStore,
  useShallowOrderFormStore,
} from "@/lib/store/trade/order-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { isLimitOrMarketOrder } from "@/features/trade/utils/orderTypes";

import OrderTPSLForm from "./OrderTPSLForm";

const OrderTPSL = () => {
  const { orderType, showTpSl } = useShallowOrderFormStore((s) => ({
    orderType: s.settings.orderType,
    showTpSl: s.settings.showTpSl,
  }));

  if (!isLimitOrMarketOrder(orderType)) return null;

  return (
    <>
      <div className="flex items-center gap-2">
        <Checkbox
          id="takeProfitAndStopLoss"
          checked={showTpSl}
          className="size-3.5 border-neutral-gray-400 data-[state=checked]:bg-white data-[state=checked]:text-primary-dark data-[state=checked]:border-white"
          onCheckedChange={(checked) => {
            // If the user is checking the checkbox, we set reduceOnly to false
            useOrderFormStore
              .getState()
              .setSettings({ showTpSl: Boolean(checked), reduceOnly: false });
          }}
        />
        <Label htmlFor="takeProfitAndStopLoss">
          <Tooltip>
            <TooltipTrigger
              asChild
              type="button"
              className="cursor-help text-3xs md:text-xs text-white"
            >
              <p>TP/SL</p>
            </TooltipTrigger>
            <TooltipContent className="max-w-80 text-neutral-gray-400 text-xs font-medium">
              <p>
                Set Take Profit and Stop Loss in advance. Based on your trading
                strategy, you can choose to use a Limit-Maker order for Take
                Profit and a Stop Limit (or Stop Market) order for Stop Loss.
              </p>
            </TooltipContent>
          </Tooltip>
        </Label>
      </div>

      {showTpSl && <OrderTPSLForm />}
    </>
  );
};

export default OrderTPSL;
