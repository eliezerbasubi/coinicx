import React from "react";

import Visibility from "@/components/common/Visibility";
import { Button } from "@/components/ui/button";
import { isLimitOrder, isStopOrder } from "@/features/trade/utils/orderTypes";
import { useShallowInstrumentStore } from "@/store/trade/instrument";
import {
  useOrderFormStore,
  useShallowOrderFormStore,
} from "@/store/trade/order-form";

import OrderFormInput from "./OrderFormInput";

const LimitMarketOrderForm = () => {
  const quote = useShallowInstrumentStore((s) => s.assetMeta?.quote);
  const { orderType, triggerPrice, limitPrice } = useShallowOrderFormStore(
    (s) => ({
      orderType: s.settings.orderType,
      triggerPrice: s.triggerPrice,
      limitPrice: s.limitPrice,
    }),
  );

  const onValueChange = (
    args: Partial<{ triggerPrice: string; limitPrice: string }>,
  ) => {
    useOrderFormStore.getState().setExecutionOrderParams(args);
  };

  if (orderType === "scale") return null;

  return (
    <React.Fragment>
      <Visibility visible={isStopOrder(orderType)}>
        <OrderFormInput
          name="triggerPrice"
          id="triggerPrice"
          value={triggerPrice}
          label="Stop Price"
          className="text-sm"
          trailing={
            <div className="flex items-center gap-x-2">
              <span className="text-neutral-300 text-sm font-medium">
                {quote}
              </span>
            </div>
          }
          onChange={(e) => onValueChange?.({ triggerPrice: e.target.value })}
        />
      </Visibility>
      <Visibility visible={isLimitOrder(orderType)}>
        <OrderFormInput
          name="limitPrice"
          id="limitPrice"
          value={limitPrice}
          label="Price"
          className="text-sm"
          trailing={
            <div className="flex items-center gap-x-2">
              <span className="text-neutral-300 text-sm font-medium">
                {quote}
              </span>

              <Button
                type="button"
                variant="ghost"
                className="size-6 bg-neutral-gray-200 text-neutral-300 hover:text-primary hover:bg-primary/10 text-xs font-semibold"
                onClick={() => useOrderFormStore.getState().onMidClick()}
              >
                Mid
              </Button>
            </div>
          }
          onChange={(e) => onValueChange?.({ limitPrice: e.target.value })}
        />
      </Visibility>
    </React.Fragment>
  );
};

export default LimitMarketOrderForm;
