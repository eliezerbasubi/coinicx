import React from "react";

import { useTradeContext } from "@/lib/store/trade/hooks";
import { useInstrumentStore } from "@/lib/store/trade/instrument";
import {
  useOrderFormStore,
  useShallowOrderFormStore,
} from "@/lib/store/trade/order-form";
import FormInputSlider from "@/components/common/FormInputSlider";

import OrderFormInput from "./OrderFormInput";
import SizeCoinSelector from "./SizeCoinSelector";

const OrderFormSize = () => {
  const isSpot = useTradeContext((s) => s.instrumentType === "spot");
  const { szPercent, size } = useShallowOrderFormStore((s) => ({
    szPercent: s.szPercent,
    size: s.size,
  }));

  return (
    <React.Fragment>
      <OrderFormInput
        name="size"
        id="size"
        value={size}
        label="Size"
        trailing={
          <SizeCoinSelector
            onValueChange={(isNtl) => {
              const assetCtx = useInstrumentStore.getState().assetCtx;
              const assetMeta = useInstrumentStore.getState().assetMeta;

              useOrderFormStore
                .getState()
                .onSizeCoinChange({
                  isNtl,
                  midPx: assetCtx?.midPx ?? 0,
                  szDecimals: assetMeta?.szDecimals ?? 0,
                });
            }}
          />
        }
        onChange={(e) =>
          useOrderFormStore
            .getState()
            .onSizeChange({ size: e.target.value, isSpot })
        }
      />
      <FormInputSlider
        value={szPercent}
        onValueChange={(value) => {
          const assetMeta = useInstrumentStore.getState().assetMeta;

          useOrderFormStore
            .getState()
            .onPercentChange({
              percent: value,
              isSpot,
              szDecimals: assetMeta?.szDecimals ?? 0,
            });
        }}
      />
    </React.Fragment>
  );
};

export default OrderFormSize;
