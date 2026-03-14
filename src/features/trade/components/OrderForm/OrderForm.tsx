"use client";

import { useMemo } from "react";

import { OrderSide } from "@/types/trade";
import TradingButton from "@/components/common/TradingButton";
import Visibility from "@/components/common/Visibility";
import { useOrderForm } from "@/features/trade/hooks/useOrderForm";
import { usePlaceOrder } from "@/features/trade/hooks/usePlaceOrder";
import { isExecutionOrder } from "@/features/trade/utils/orderTypes";
import { useAccountTransactStore } from "@/store/trade/account-transact";
import { useTradeContext } from "@/store/trade/hooks";
import {
  useOrderFormStore,
  useShallowOrderFormStore,
} from "@/store/trade/order-form";
import { cn } from "@/utils/cn";

import AdjustTradeSettings from "./AdjustTradeSettings";
import AvailableBalance from "./AvailableBalance";
import ExecutionOrderForm from "./ExecutionOrderForm";
import {
  Fees,
  LiquidationPrice,
  MaxOrderSize,
  OrderSlippage,
  OrderValueAndMarginRequired,
  TwapDetails,
} from "./OrderDetails";
import OrderFormSize from "./OrderFormSize";
import OrderFormType from "./OrderFormType";
import OrderTPSL from "./OrderTPSL";
import ReduceOnly from "./ReduceOnly";
import ScaleOrderForm from "./ScaleOrderForm";
import TIFSelector from "./TIFSelector";
import TwapOrderForm from "./TwapOrderForm";

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

type Props = {
  className?: string;
};

const OrderForm = ({ className }: Props) => {
  const isPerps = useTradeContext((s) => s.instrumentType === "perps");
  const orderType = useOrderFormStore((s) => s.settings.orderType);

  return (
    <div
      className={cn(
        "w-full md:max-w-80 lg:max-w-65 xl:max-w-80 bg-primary-dark md:rounded-md",
        className,
      )}
    >
      <div className="w-full border-b border-neutral-gray-200 px-4 h-11 hidden md:flex items-center justify-between">
        <p className="text-sm font-semibold">Trade</p>
      </div>

      <Visibility visible={isPerps}>
        <AdjustTradeSettings />
      </Visibility>

      <OrderFormType />

      <OrderFormSides />

      <form className="w-full md:px-4 space-y-1 md:space-y-2 overflow-x-hidden">
        <AvailableBalance />

        <Visibility visible={isExecutionOrder(orderType)}>
          <ExecutionOrderForm />
        </Visibility>

        <OrderFormSize />

        <Visibility visible={orderType === "scale"}>
          <ScaleOrderForm />
        </Visibility>

        <Visibility visible={orderType === "twap"}>
          <TwapOrderForm />
        </Visibility>

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
    <div className="w-full md:px-4 my-2">
      <div className="bg-neutral-gray-200 rounded h-6 md:h-7 flex justify-between items-center gap-x-1">
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
            <p className="text-xs md:text-sm font-medium">{label[labelKey]}</p>
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
    orderType,
    orderSizeInBase,
    orderValueAndMargin,
    hasInsufficientMargin,
  } = useOrderForm();

  const { processing, onPlaceOrder } = usePlaceOrder();

  const isPerps = useTradeContext((s) => s.instrumentType === "perps");

  const labelKey = isPerps ? "perp" : "spot";

  const label = useMemo(() => {
    if (hasInsufficientMargin) {
      return "Deposit";
    }

    return ORDER_FORM_SIDES[orderSide][labelKey];
  }, [hasInsufficientMargin, orderSide, labelKey]);

  const placeOrder = () => {
    if (hasInsufficientMargin)
      return useAccountTransactStore.getState().openAccountTransact("deposit");
    return onPlaceOrder();
  };

  return (
    <>
      <TradingButton
        type="button"
        size="default"
        disabled={disabled || processing}
        loading={processing}
        label={label}
        className={cn(
          "h-8.25 md:h-10 text-xs md:text-base font-medium md:font-bold bg-buy hover:bg-buy/90 text-white capitalize mt-1 transition-colors",
          {
            "bg-sell hover:bg-sell/90": !isBuyOrder,
            "bg-primary text-background hover:bg-primary/90":
              hasInsufficientMargin,
          },
        )}
        onClick={placeOrder}
      />

      <div className="w-full space-y-1 md:space-y-2">
        <LiquidationPrice size={orderSizeInBase} />

        <OrderValueAndMarginRequired data={orderValueAndMargin} />

        <OrderSlippage size={orderSizeInBase} />

        <Visibility visible={orderType === "twap"}>
          <TwapDetails size={orderSizeInBase} />
        </Visibility>

        <MaxOrderSize />

        <Fees />
      </div>
    </>
  );
};

export default OrderForm;
