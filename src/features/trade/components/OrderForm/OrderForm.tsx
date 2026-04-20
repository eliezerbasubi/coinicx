"use client";

import { useMemo } from "react";

import { useAccountTransactStore } from "@/lib/store/trade/account-transact";
import {
  useOrderFormStore,
  useShallowOrderFormStore,
} from "@/lib/store/trade/order-form";
import { OrderSide } from "@/lib/types/trade";
import { cn } from "@/lib/utils/cn";
import TradingButton from "@/components/common/TradingButton";
import Visibility from "@/components/common/Visibility";
import { ORDER_FORM_SIDES } from "@/features/trade/constants";
import { useOrderForm } from "@/features/trade/hooks/useOrderForm";
import { usePlaceOrder } from "@/features/trade/hooks/usePlaceOrder";
import { useTradeContext } from "@/features/trade/store/hooks";
import { isExecutionOrder } from "@/features/trade/utils/orderTypes";
import { isUSDCQuote } from "@/features/trade/utils/shared";

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
  const { isPerps, getState } = useTradeContext((s) => ({
    isPerps: s.instrumentType === "perps",
    base: s.assetMeta.base,
    quote: s.assetMeta.quote,
    getState: s.getState,
  }));
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
            onClick={() => {
              const { assetCtx, assetMeta } = getState();
              useOrderFormStore.getState().onOrderSideChange({
                orderSide: side as OrderSide,
                spotAsset: !isPerps
                  ? { base: assetMeta.base, quote: assetMeta.quote }
                  : undefined,
                midPx: assetCtx.midPx ?? 0,
              });
            }}
          >
            <p className="text-xs md:text-sm font-medium">{label[labelKey]}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

const OrderFormFooter = () => {
  const { isPerps, quote, assetMeta, assetCtx } = useTradeContext((s) => ({
    isPerps: s.instrumentType === "perps",
    quote: s.assetMeta.quote,
    assetMeta: s.assetMeta,
    assetCtx: s.assetCtx,
  }));

  const {
    disabled,
    isBuyOrder,
    orderSide,
    orderType,
    orderSizeInBase,
    orderValueAndMargin,
    hasInsufficientMargin,
  } = useOrderForm({
    spotAsset: !isPerps
      ? { base: assetMeta.base, quote: assetMeta.quote }
      : undefined,
    referencePx: assetCtx?.referencePx ?? 0,
    szDecimals: assetMeta?.szDecimals ?? 0,
  });

  const { processing, onPlaceOrder } = usePlaceOrder({
    assetId: assetMeta?.assetId ?? 0,
    szDecimals: assetMeta?.szDecimals ?? 0,
    isSpot: !isPerps,
    base: assetMeta?.base ?? "",
  });

  const isUSDC = isUSDCQuote(quote);

  const labelKey = isPerps ? "perp" : "spot";

  const label = useMemo(() => {
    if (hasInsufficientMargin) {
      // If quote is not USDC, we request the user to swap first
      if (!isUSDC && isPerps) return "Swap";

      // Otherwise we request the user to deposit
      return "Deposit";
    }

    return ORDER_FORM_SIDES[orderSide][labelKey];
  }, [hasInsufficientMargin, orderSide, labelKey]);

  const placeOrder = () => {
    if (hasInsufficientMargin) {
      if (!isUSDC && isPerps)
        return useAccountTransactStore.getState().openSwapModal(quote!);

      return useAccountTransactStore.getState().openAccountTransact("deposit");
    }

    return onPlaceOrder({
      referencePx: assetCtx?.referencePx ?? 0,
      midPx: assetCtx?.midPx ?? 0,
      assetId: assetMeta?.assetId ?? 0,
      szDecimals: assetMeta?.szDecimals ?? 0,
      isSpot: !isPerps,
    });
  };

  return (
    <>
      <TradingButton
        type="button"
        size="default"
        disabled={!hasInsufficientMargin && (disabled || processing)}
        loading={processing}
        label={label}
        className={cn(
          "h-8 md:h-10 text-xs md:text-base font-medium md:font-bold bg-buy hover:bg-buy/90 text-white capitalize mt-1 transition-colors",
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
