"use client";

import { useMemo } from "react";

import { OrderSide } from "@/types/trade";
import ConnectButton from "@/components/common/ConnectButton";
import Visibility from "@/components/common/Visibility";
import { useOrderForm } from "@/features/trade/hooks/useOrderForm";
import { usePlaceOrder } from "@/features/trade/hooks/usePlaceOrder";
import { useTradeContext } from "@/store/trade/hooks";
import {
  useOrderFormStore,
  useShallowOrderFormStore,
} from "@/store/trade/order-form";
import { cn } from "@/utils/cn";

import AdjustTradeSettings from "./AdjustTradeSettings";
import AvailableBalance from "./AvailableBalance";
import LimitMarketOrderForm from "./LimitMarketOrderForm";
import {
  Fees,
  LiquidationPrice,
  MaxOrderSize,
  OrderSlippage,
  OrderValueAndMarginRequired,
} from "./OrderDetails";
import OrderFormSize from "./OrderFormSize";
import OrderFormType from "./OrderFormType";
import OrderTPSL from "./OrderTPSL";
import ReduceOnly from "./ReduceOnly";
import ScaleOrderForm from "./ScaleOrderForm";
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
  const isPerps = useTradeContext((s) => s.instrumentType === "perps");

  return (
    <div className="w-full md:max-w-80 bg-primary-dark md:rounded-md pb-12 md:pb-0">
      <div className="w-full border-b border-neutral-gray-200 px-4 h-11 flex items-center justify-between">
        <p className="text-sm font-semibold">Trade</p>
      </div>

      <Visibility visible={isPerps}>
        <AdjustTradeSettings />
      </Visibility>

      <OrderFormType />

      <OrderFormSides />

      <form className="w-full px-4 space-y-2 overflow-x-hidden">
        <AvailableBalance />

        <LimitMarketOrderForm />

        <OrderFormSize />

        <ScaleOrderForm />

        <div className="w-full flex items-center justify-between">
          <Visibility visible={isPerps}>
            <ReduceOnly />
          </Visibility>

          <TIFSelector />
        </div>

        <Visibility visible={isPerps}>
          <OrderTPSL />
        </Visibility>

        <OrderFormFooter />
      </form>
    </div>
  );
};

const OrderFormSides = () => {
  const isPerps = useTradeContext((s) => s.instrumentType === "perps");
  const orderSide = useShallowOrderFormStore((s) => s.orderSide);

  const isBuyOrder = orderSide === "buy";
  const labelKey = isPerps ? "perp" : "spot";

  return (
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
            onClick={() =>
              useOrderFormStore
                .getState()
                .onOrderSideChange(side as OrderSide, !isPerps)
            }
          >
            <p className="text-sm font-medium">{label[labelKey]}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

const OrderFormFooter = () => {
  const {
    disabled,
    isBuyOrder,
    orderSide,
    orderSizeInBase,
    orderValueAndMargin,
    hasInsufficientMargin,
  } = useOrderForm();

  const { shouldEnableTrading, processing, onPlaceOrder } = usePlaceOrder();

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
    <>
      <ConnectButton
        type="button"
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
        onClick={onPlaceOrder}
      />

      <div className="w-full space-y-2">
        <LiquidationPrice size={orderSizeInBase} />
        <OrderValueAndMarginRequired data={orderValueAndMargin} />
        <MaxOrderSize />
        <OrderSlippage size={orderSizeInBase} />
        <Fees />
      </div>
    </>
  );
};

export default OrderForm;
