import React from "react";

import { useTradeContext } from "@/lib/store/trade/hooks";
import {
  useInstrumentStore,
  useShallowInstrumentStore,
} from "@/lib/store/trade/instrument";
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

  const szDecimals = useShallowInstrumentStore(
    (s) => s.assetMeta?.szDecimals ?? 0,
  );

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
              const midPx = useInstrumentStore.getState().assetCtx?.midPx ?? 0;

              useOrderFormStore.getState().onSizeCoinChange({
                isNtl,
                midPx,
                szDecimals,
              });
            }}
          />
        }
        onChange={(e) => {
          const midPx = useInstrumentStore.getState().assetCtx?.midPx ?? 0;

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
          const midPx = useInstrumentStore.getState().assetCtx?.midPx ?? 0;

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
