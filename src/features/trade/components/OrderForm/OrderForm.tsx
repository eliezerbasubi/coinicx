"use client";

import { useMemo } from "react";

import { OrderSide } from "@/types/trade";
import ConnectButton from "@/components/common/ConnectButton";
import Visibility from "@/components/common/Visibility";
import { Button } from "@/components/ui/button";
import { useOrderForm } from "@/features/trade/hooks/useOrderForm";
import { usePlaceOrder } from "@/features/trade/hooks/usePlaceOrder";
import {
  isLimitOrder,
  isLimitOrMarketOrder,
  isStopOrder,
} from "@/features/trade/utils/orderTypes";
import { useTradeContext } from "@/store/trade/hooks";
import { useInstrumentStore } from "@/store/trade/instrument";
import { cn } from "@/utils/cn";

import AdjustTradeSettings from "./AdjustTradeSettings";
import AvailableBalance from "./AvailableBalance";
import {
  Fees,
  LiquidationPrice,
  MaxOrderSize,
  OrderSlippage,
  OrderValueAndMarginRequired,
} from "./OrderDetails";
import OrderFormInput from "./OrderFormInput";
import OrderFormSlider from "./OrderFormSlider";
import OrderFormType from "./OrderFormType";
import OrderTPSL from "./OrderTPSL";
import ReduceOnly from "./ReduceOnly";
import SizeCoinSelector from "./SizeCoinSelector";
import TIFSelector from "./TIFSelector";

const ORDER_FORM_SIDES: Record<OrderSide, { spot: string; perp: string }> = {
  buy: {
    spot: "Buy",
    perp: "Long",
  },
  sell: {
    spot: "Sell",
    perp: "Short",
  },
};

const OrderForm = () => {
  const {
    state,
    disabled,
    isBuyOrder,
    orderType,
    orderSide,
    orderSizeInBase,
    orderValueAndMarginRequired,
    hasInsufficientMargin,
    dispatch,
    onOrderSideChange,
    onMidClick,
    onPercentChange,
    onSizeChange,
    onSizeCoinChange,
  } = useOrderForm();

  const { shouldEnableTrading, processing, onPlaceOrder } = usePlaceOrder();

  const quote = useInstrumentStore((s) => s.assetMeta?.quote);
  const isPerps = useTradeContext((s) => s.instrumentType === "perps");

  const labelKey = isPerps ? "perp" : "spot";

  const label = useMemo(() => {
    if (shouldEnableTrading) {
      return "Enable Trading";
    }
    if (hasInsufficientMargin) {
      return "Deposit";
    }

    return ORDER_FORM_SIDES[orderSide][labelKey];
  }, [hasInsufficientMargin, shouldEnableTrading, orderSide, labelKey]);

  return (
    <div className="w-full md:max-w-80 bg-primary-dark md:rounded-md pb-12 md:pb-0">
      <div className="w-full border-b border-neutral-gray-200 px-4 h-11 flex items-center justify-between">
        <p className="text-sm font-semibold">Trade</p>
      </div>

      <Visibility visible={isPerps}>
        <AdjustTradeSettings />
      </Visibility>

      <OrderFormType />

      <div className="w-full px-4 my-2">
        <div className="bg-neutral-gray-200 rounded h-7 flex justify-between items-center gap-x-1">
          {Object.entries(ORDER_FORM_SIDES).map(([side, label]) => (
            <button
              key={side}
              className={cn(
                "w-full h-full flex items-center justify-center rounded text-center text-neutral-gray-400 cursor-pointer transition-colors",
                {
                  "bg-sell text-white": side === orderSide && !isBuyOrder,
                  "bg-buy text-white": side === orderSide && isBuyOrder,
                },
              )}
              onClick={() => onOrderSideChange(side as OrderSide)}
            >
              <p className="text-sm font-medium">{label[labelKey]}</p>
            </button>
          ))}
        </div>
      </div>

      <form
        onSubmit={onPlaceOrder}
        className="w-full px-4 space-y-2 overflow-x-hidden"
      >
        <AvailableBalance />

        <Visibility visible={isStopOrder(orderType)}>
          <OrderFormInput
            name="triggerPrice"
            id="triggerPrice"
            value={state.triggerPrice}
            label="Stop Price"
            className="text-sm"
            trailing={
              <div className="flex items-center gap-x-2">
                <span className="text-neutral-300 text-sm font-medium">
                  {quote}
                </span>
              </div>
            }
            onChange={({ target: { value } }) =>
              dispatch({ triggerPrice: value })
            }
          />
        </Visibility>
        <Visibility visible={isLimitOrder(orderType)}>
          <OrderFormInput
            name="limitPrice"
            id="limitPrice"
            value={state.limitPrice}
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
                  onClick={onMidClick}
                >
                  Mid
                </Button>
              </div>
            }
            onChange={({ target: { value } }) =>
              dispatch({ limitPrice: value })
            }
          />
        </Visibility>

        <OrderFormInput
          name="size"
          id="size"
          value={state.size}
          label="Size"
          className="text-sm"
          trailing={<SizeCoinSelector onValueChange={onSizeCoinChange} />}
          onChange={(e) => onSizeChange(e.target.value)}
        />

        <OrderFormSlider
          value={state.szPercent}
          onValueChange={onPercentChange}
        />

        <div className="w-full flex items-center justify-between">
          <Visibility visible={isPerps}>
            <ReduceOnly />
          </Visibility>

          <TIFSelector />
        </div>

        <Visibility visible={isPerps && isLimitOrMarketOrder(orderType)}>
          <OrderTPSL />
        </Visibility>

        <ConnectButton
          type={shouldEnableTrading ? "button" : "submit"}
          size="default"
          disabled={!shouldEnableTrading && (disabled || processing)}
          loading={processing}
          label={label}
          className={cn(
            "font-bold bg-buy hover:bg-buy/90 text-white capitalize mt-1 transition-colors",
            {
              "bg-sell hover:bg-sell/90": !isBuyOrder,
              "bg-primary text-background hover:bg-primary/90":
                hasInsufficientMargin,
            },
          )}
        />

        <div className="w-full space-y-2">
          <LiquidationPrice
            size={orderSizeInBase}
            limitPrice={state.limitPrice}
          />
          <OrderValueAndMarginRequired data={orderValueAndMarginRequired} />
          <MaxOrderSize />
          <OrderSlippage size={orderSizeInBase} />
          <Fees />
        </div>
      </form>
    </div>
  );
};

export default OrderForm;
