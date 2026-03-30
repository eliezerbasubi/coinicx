"use client";

import { useCallback, useState } from "react";
import { ArrowDown } from "lucide-react";

import { SwapInputType } from "@/lib/types/swap";
import { cn } from "@/lib/utils/cn";
import ConnectButton from "@/components/common/ConnectButton";
import TradingButton from "@/components/common/TradingButton";
import { Button } from "@/components/ui/button";

import { useExecuteSwap } from "../hooks/useExecuteSwap";
import { useSwapOrderBook } from "../hooks/useSwapOrderBook";
import { useShallowSwapStore, useSwapStore } from "../store";
import ReviewSummary from "./ReviewSummary";
import SwapInput from "./SwapInput";
import SwapTokenSelector from "./SwapTokenSelector";

const SwapForm = () => {
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [currentInput, setCurrentInput] = useState<SwapInputType>("sell");

  const {
    sellTokenName,
    sellTokenBalance,
    buyTokenName,
    buyTokenBalance,
    sellAmount,
    buyAmount,
    insufficientLiquidity,
  } = useShallowSwapStore((s) => ({
    sellTokenName: s.sellToken?.name,
    sellTokenBalance: s.sellToken?.balance,
    buyTokenName: s.buyToken?.name,
    buyTokenBalance: s.buyToken?.balance,
    sellAmount: s.sellAmount,
    buyAmount: s.buyAmount,
    insufficientLiquidity: !!s.route?.insufficientLiquidity,
    activeInput: s.activeInput,
  }));

  // Subscribe to orderbook updates for the selected pair
  useSwapOrderBook();

  const { processing, executeSwap } = useExecuteSwap();

  const isDisabled = processing || insufficientLiquidity;
  const insufficientBalance =
    !!sellTokenBalance &&
    !!sellAmount &&
    parseFloat(sellAmount) > parseFloat(sellTokenBalance);

  const showSummary =
    !!sellTokenName &&
    !!buyTokenName &&
    (!!parseFloat(sellAmount) || !!parseFloat(buyAmount));

  const buttonLabel = insufficientBalance
    ? `Insufficient ${sellTokenName} balance`
    : insufficientLiquidity
      ? "Insufficient liquidity"
      : "Swap";

  const onSelectorOpen = useCallback((type: SwapInputType) => {
    setSelectorOpen(true);
    setCurrentInput(type);
  }, []);

  const onValueChange = (value: string, type: SwapInputType) => {
    useSwapStore.getState().onValueChange(value, type);
    setCurrentInput(type);
  };

  return (
    <div className="w-full space-y-1">
      <div className="relative w-full flex flex-col items-center justify-center gap-y-1">
        <SwapInput
          type="sell"
          readOnly={currentInput !== "sell"}
          value={sellAmount}
          tokenName={sellTokenName}
          tokenBalance={sellTokenBalance}
          onSelectorOpen={onSelectorOpen}
          onValueChange={onValueChange}
          onClick={setCurrentInput}
        />
        <Button
          variant="ghost"
          onClick={useSwapStore.getState().switchTokens}
          className="absolute z-10 size-10 grid place-content-center bg-background rounded-xl cursor-pointer p-0"
        >
          <div className="size-8.5 grid place-content-center text-center bg-neutral-gray-600 hover:bg-neutral-gray-200 rounded-xl">
            <ArrowDown className="text-white" />
          </div>
        </Button>
        <SwapInput
          type="buy"
          readOnly={currentInput !== "buy"}
          value={buyAmount}
          tokenName={buyTokenName}
          tokenBalance={buyTokenBalance}
          onSelectorOpen={onSelectorOpen}
          onValueChange={onValueChange}
          onClick={setCurrentInput}
        />
      </div>

      <div
        className={cn("grid grid-rows-[0fr] duration-300 mb-1", {
          "grid-rows-[1fr] mt-1": showSummary,
        })}
      >
        <div
          className={cn(
            "overflow-hidden opacity-0 duration-300 text-sm font-medium text-red-500",
            {
              "opacity-100": showSummary,
            },
          )}
        >
          <ReviewSummary />
        </div>
      </div>
      <TradingButton
        label={buttonLabel}
        disabled={!!isDisabled || !!insufficientBalance}
        loading={processing}
        onClick={executeSwap}
        className="rounded-xl h-12 md:h-13 text-base"
      />

      <SwapTokenSelector
        open={selectorOpen}
        onOpenChange={setSelectorOpen}
        onSelect={(token) =>
          useSwapStore.getState().selectToken(token, currentInput)
        }
      />
    </div>
  );
};

export default SwapForm;
