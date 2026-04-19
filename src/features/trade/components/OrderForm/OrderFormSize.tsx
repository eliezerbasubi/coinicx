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
  const { isSpot, getState } = useTradeContext((s) => ({
    isSpot: s.instrumentType === "spot",
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
              const { assetCtx, assetMeta } = getState();
              useOrderFormStore.getState().onSizeCoinChange({
                isNtl,
                midPx: assetCtx.midPx,
                szDecimals: assetMeta.szDecimals,
                isSpot,
              });
            }}
          />
        }
        onChange={(e) => {
          const { assetCtx } = getState();
          useOrderFormStore.getState().onSizeChange({
            size: e.target.value,
            isSpot,
            midPx: assetCtx.midPx,
          });
        }}
      />
      <FormInputSlider
        value={szPercent}
        onValueChange={(value) => {
          const { assetCtx, assetMeta } = getState();
          useOrderFormStore.getState().onPercentChange({
            percent: value,
            isSpot,
            szDecimals: assetMeta.szDecimals,
            midPx: assetCtx.midPx,
          });
        }}
      />
    </React.Fragment>
  );
};

export default OrderFormSize;
