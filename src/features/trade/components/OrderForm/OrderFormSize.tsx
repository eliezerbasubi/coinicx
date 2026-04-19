import React from "react";

import {
  useOrderFormStore,
  useShallowOrderFormStore,
} from "@/lib/store/trade/order-form";
import FormInputSlider from "@/components/common/FormInputSlider";
import { useTradeContext } from "@/features/trade/store/hooks";

import OrderFormInput from "./OrderFormInput";
import SizeCoinSelector from "./SizeCoinSelector";

const OrderFormSize = () => {
  const { isSpot, szDecimals, getState } = useTradeContext((s) => ({
    isSpot: s.instrumentType === "spot",
    szDecimals: s.assetMeta.szDecimals,
    getState: s.getState,
  }));

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
              const midPx = getState().assetCtx.midPx;

              useOrderFormStore.getState().onSizeCoinChange({
                isNtl,
                midPx,
                szDecimals,
                isSpot,
              });
            }}
          />
        }
        onChange={(e) => {
          const midPx = getState().assetCtx.midPx;

          useOrderFormStore.getState().onSizeChange({
            size: e.target.value,
            isSpot,
            midPx,
          });
        }}
      />
      <FormInputSlider
        value={szPercent}
        onValueChange={(value) => {
          const midPx = getState().assetCtx.midPx;

          useOrderFormStore.getState().onPercentChange({
            percent: value,
            isSpot,
            szDecimals,
            midPx,
          });
        }}
      />
    </React.Fragment>
  );
};

export default OrderFormSize;
