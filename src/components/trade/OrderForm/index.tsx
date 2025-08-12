"use client";

import React, { useReducer } from "react";

import { OrderType } from "@/types/trade";
import UnderlineTooltip from "@/components/common/UnderlineTooltip";
import { Button } from "@/components/ui/button";
import { useTradeContext } from "@/store/trade/hooks";
import { cn } from "@/utils/cn";

import LimitOrderTPSL from "./LimitOrderTPSL";
import LimitOrderTPSLForm from "./LimitOrderTPSLForm";
import OrderFormInput from "./OrderFormInput";
import OrderFormSlider from "./OrderFormSlider";
import OrderFormType from "./OrderFormType";
import TradeTypeTab from "./TradeTypeTab";

type State = {
  orderType: OrderType;
  price: string;
  amount: string;
  percentage: number;
  orderSide: "buy" | "sell";
  showLimitOrderTPSL: boolean;
};

const ORDER_FORM_SIDES: Array<{ label: string; value: "buy" | "sell" }> = [
  { label: "Buy", value: "buy" },
  { label: "Sell", value: "sell" },
];

const OrderForm = () => {
  const [state, dispatch] = useReducer(
    (prev: State, next: Partial<State>) => ({ ...prev, ...next }),
    {
      orderType: "limit",
      price: "",
      amount: "",
      percentage: 0,
      orderSide: "buy",
      showLimitOrderTPSL: false,
    },
  );

  const baseAsset = useTradeContext((s) => s.baseAsset);
  const quoteAsset = useTradeContext((s) => s.quoteAsset);

  const isBuyOrder = state.orderSide === "buy";

  return (
    <div className="w-full md:max-w-80 bg-primary-dark rounded-md pb-12 md:pb-0">
      <div className="w-full border-b border-neutral-gray-200 px-4 h-11 flex items-center justify-between">
        <p className="text-sm font-semibold">Trade</p>
      </div>

      <TradeTypeTab />
      <div className="w-full px-4 mb-1 mt-4">
        <div className="bg-neutral-gray-200 rounded h-9 flex justify-between items-center gap-x-1">
          {ORDER_FORM_SIDES.map((side) => (
            <button
              key={side.value}
              className={cn(
                "w-full h-full flex items-center justify-center rounded text-center text-neutral-gray-400 cursor-pointer",
                {
                  "bg-sell text-white":
                    side.value === state.orderSide &&
                    state.orderSide === "sell",
                  "bg-buy text-white":
                    side.value === state.orderSide && state.orderSide === "buy",
                },
              )}
              onClick={() => dispatch({ orderSide: side.value })}
            >
              <p className="text-sm font-semibold">{side.label}</p>
            </button>
          ))}
        </div>
      </div>

      <OrderFormType
        type={state.orderType}
        onValueChange={(type) => dispatch({ orderType: type })}
      />

      <form className="w-full px-4 space-y-4 overflow-x-hidden">
        <OrderFormInput
          name="price"
          id="price"
          value={state.price}
          label="Price"
          trailing={
            <span className="text-white text-sm font-semibold">
              {quoteAsset}
            </span>
          }
          onChange={({ target: { value } }) => dispatch({ price: value })}
        />
        <OrderFormInput
          name="amount"
          id="amount"
          value={state.amount}
          label="Amount"
          trailing={
            <span className="text-white text-sm font-semibold">
              {baseAsset}
            </span>
          }
          onChange={({ target: { value } }) => dispatch({ amount: value })}
        />

        <OrderFormSlider
          value={state.percentage}
          onValueChange={(value) => dispatch({ percentage: value })}
        />

        {state.orderType === "limit" && (
          <>
            <LimitOrderTPSL
              checked={state.showLimitOrderTPSL}
              onCheckedChange={(checked) =>
                dispatch({ showLimitOrderTPSL: checked })
              }
            />
            {state.showLimitOrderTPSL && <LimitOrderTPSLForm />}
          </>
        )}

        <div className="w-full space-y-2">
          <div className="w-full flex items-center justify-between">
            <p className="text-xs text-neutral-gray-400">Available Balance</p>
            <p className="text-xs font-medium">
              --{isBuyOrder ? quoteAsset : baseAsset}
            </p>
          </div>
          <div className="w-full flex items-center justify-between">
            <UnderlineTooltip
              className="text-xs text-neutral-gray-400"
              content="The Max buy or Max sell amount depends on your available balance and the price at which you want to trade. The Max buy or Max sell will be calculated automatically when you input a limit price."
            >
              <p>Max. {isBuyOrder ? "buying" : "selling"} amount</p>
            </UnderlineTooltip>

            <p className="text-xs font-medium">
              --{isBuyOrder ? baseAsset : quoteAsset}
            </p>
          </div>
        </div>

        <Button
          type="button"
          size="default"
          className={cn(
            "font-bold bg-buy hover:bg-buy/70 text-white capitalize mt-1",
            {
              "bg-sell hover:bg-sell/70": state.orderSide === "sell",
            },
          )}
        >
          {state.orderSide}
        </Button>
      </form>
    </div>
  );
};

export default OrderForm;
