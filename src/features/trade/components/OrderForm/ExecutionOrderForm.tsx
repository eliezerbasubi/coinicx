import React from "react";

import {
  useOrderFormStore,
  useShallowOrderFormStore,
} from "@/lib/store/trade/order-form";
import Visibility from "@/components/common/Visibility";
import { Button } from "@/components/ui/button";
import { useTradeContext } from "@/features/trade/store/hooks";
import { roundToDecimals } from "@/features/trade/utils";
import { isLimitOrder, isStopOrder } from "@/features/trade/utils/orderTypes";

import OrderFormInput from "./OrderFormInput";
import TrailingQuote from "./TrailingQuote";

const ExecutionOrderForm = () => {
  const { quote, getState } = useTradeContext((s) => ({
    quote: s.assetMeta?.quote,
    getState: s.getState,
  }));

  const { orderType, triggerPrice, limitPrice } = useShallowOrderFormStore(
    (s) => ({
      orderType: s.settings.orderType,
      triggerPrice: s.triggerPrice,
      limitPrice: s.limitPrice,
    }),
  );

  const onValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    useOrderFormStore.getState().setExecutionOrder({
      [e.target.name]: e.target.value,
    });
  };

  return (
    <React.Fragment>
      <Visibility visible={isStopOrder(orderType)}>
        <OrderFormInput
          name="triggerPrice"
          id="triggerPrice"
          value={triggerPrice}
          label="Stop Price"
          trailing={<TrailingQuote />}
          onChange={onValueChange}
        />
      </Visibility>
      <Visibility visible={isLimitOrder(orderType)}>
        <OrderFormInput
          name="limitPrice"
          id="limitPrice"
          value={limitPrice}
          label="Price"
          wrapperClassName="pr-1 md:pr-2"
          trailing={
            <div className="flex items-center gap-x-2">
              <span className="text-neutral-300 text-3xs md:text-sm font-medium">
                {quote}
              </span>

              <Button
                type="button"
                variant="ghost"
                className="w-6 h-5 md:size-6 bg-neutral-gray-200 text-neutral-300 hover:text-primary hover:bg-primary/10 text-3xs md:text-xs font-medium md:font-semibold rounded md:rounded-md"
                onClick={() => {
                  const { assetCtx, assetMeta } = getState();

                  useOrderFormStore
                    .getState()
                    .onMidClick(
                      roundToDecimals(
                        assetCtx.midPx,
                        assetMeta.pxDecimals ?? 2,
                        "floor",
                      ),
                    );
                }}
              >
                Mid
              </Button>
            </div>
          }
          onChange={onValueChange}
        />
      </Visibility>
    </React.Fragment>
  );
};

export default ExecutionOrderForm;
