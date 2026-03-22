import { useState } from "react";
import { ChevronDown, PlusCircle } from "lucide-react";

import { useAccountTransactStore } from "@/lib/store/trade/account-transact";
import { SwapInputType } from "@/lib/types/swap";
import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import TokenImage from "@/components/common/TokenImage";
import Visibility from "@/components/common/Visibility";
import { InputNumber } from "@/components/ui/input-number";
import { removeTrailingZeros } from "@/features/trade/utils";

import { useShallowSwapStore } from "../store";
import { isQuoteAsset } from "../utils/swap";

type Props = {
  type: SwapInputType;
  tokenName?: string;
  tokenBalance?: string;
  value: string;
  readOnly?: boolean;
  onValueChange?: (value: string, type: SwapInputType) => void;
  onClick?: (type: SwapInputType) => void;
  onSelectorOpen?: (type: SwapInputType) => void;
};

const SwapInput = ({
  readOnly,
  type,
  value,
  tokenName,
  tokenBalance,
  onClick,
  onSelectorOpen,
  onValueChange,
}: Props) => {
  const [currentPercentage, setCurrentPercentage] = useState(-1);

  const isSell = type === "sell";
  const showSelectLabel = !tokenName;
  const insufficientBalance =
    isSell && Number(tokenBalance || "0") < Number(value);

  const onPercentageChange = (percentage: number) => {
    const amount = parseFloat(tokenBalance || "0") * (percentage / 100);
    onValueChange?.(removeTrailingZeros(amount.toFixed(8)), type);
    setCurrentPercentage(percentage);
  };

  const onSelectorClick = () => {
    onSelectorOpen?.(type);
  };

  const onWrapperClick = () => {
    // Open token selector if the current input does not have any token selected
    if (showSelectLabel) {
      onSelectorClick();
    } else {
      onClick?.(type);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        "w-full min-h-32 border border-neutral-gray-200 focus-within:border-primary rounded-xl p-4 transition-colors duration-500 ease-in-out cursor-pointer",
        {
          "bg-neutral-gray-600 border-neutral-gray-600/10": readOnly,
        },
      )}
      onClick={onWrapperClick}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-neutral-gray-400">
          {isSell ? "Sell" : "Buy"}
        </p>

        {isSell && (
          <PercentageBadges
            disabled={!tokenBalance || !Number(tokenBalance)}
            readOnly={readOnly}
            className={cn({ "opacity-0 pointer-events-none": showSelectLabel })}
            onValueChange={onPercentageChange}
            isActive={(percent) => percent === currentPercentage && !!value}
          />
        )}
      </div>

      <div className="w-full flex items-center justify-between gap-x-2 py-1">
        <InputNumber
          readOnly={readOnly}
          value={value}
          placeholder="0"
          className={cn(
            "w-fit min-w-0 appearance-none outline-0 h-12 text-4xl font-bold placeholder:text-neutral-gray-400 text-white",
            {
              "cursor-pointer": showSelectLabel && !readOnly,
              "text-red-500": insufficientBalance,
            },
          )}
          onChange={(e) => onValueChange?.(e.target.value, type)}
        />

        <button
          onClick={onSelectorClick}
          className={cn(
            "flex items-center gap-1 p-0.5 pr-2 border border-neutral-gray-200 text-white rounded-full transition-colors duration-500 ease-in-out cursor-pointer",
            {
              "bg-primary border-primary text-background px-2 h-8.5":
                showSelectLabel,
            },
          )}
        >
          <Visibility
            visible={!showSelectLabel}
            fallback={
              <span className="whitespace-nowrap text-sm font-semibold">
                Select Token
              </span>
            }
          >
            <TokenImage
              key={tokenName}
              instrumentType="spot"
              name={tokenName ?? ""}
              className="size-7 text-foreground"
            />
            <p className="text-sm font-semibold">{tokenName}</p>
          </Visibility>
          <ChevronDown
            className={cn("text-neutral-gray-400 size-4", {
              "text-background": showSelectLabel,
            })}
            strokeWidth={3}
          />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <ValueNotional
          type={type}
          value={value}
          isStableCoin={!!tokenName && isQuoteAsset(tokenName)}
          className={cn({ hidden: showSelectLabel })}
        />

        <Visibility visible={!showSelectLabel && !!Number(tokenBalance || "0")}>
          <div className="flex items-center gap-1">
            <p
              onClick={() => onValueChange?.(tokenBalance || "0", type)}
              className={cn(
                "text-xs font-medium text-neutral-gray-400 transition-colors duration-500 ease-in-out",
                {
                  "text-red-500": insufficientBalance,
                },
              )}
            >
              {formatNumber(Number(tokenBalance || "0"), {
                maximumFractionDigits: 10,
                symbol: tokenName,
              })}
            </p>

            <Visibility visible={type === "sell"}>
              <PlusCircle
                className="size-3.5 text-primary"
                onClick={() =>
                  useAccountTransactStore
                    .getState()
                    .openAccountTransact("deposit")
                }
              />
            </Visibility>
          </div>
        </Visibility>
      </div>
    </div>
  );
};

const PERCENTAGES = [25, 50, 75, 100];

type PercentageBadgesProps = {
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  onValueChange?: (value: number) => void;
  isActive?: (percent: number) => boolean;
};

const PercentageBadges = ({
  disabled,
  readOnly,
  className,
  isActive,
  onValueChange,
}: PercentageBadgesProps) => {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-x-1 transition-opacity duration-500 ease-in-out",
        className,
      )}
    >
      {PERCENTAGES.map((percentage) => (
        <button
          type="button"
          key={percentage}
          disabled={disabled}
          className={cn(
            "min-w-0 basis-auto border border-neutral-gray-200 rounded-lg py-0.5 px-1.5 text-neutral-gray-400 font-medium text-xs cursor-pointer disabled:bg-neutral-gray-600 active:bg-neutral-gray-600 disabled:cursor-not-allowed",
            { "border-neutral-gray-600": readOnly },
            { "bg-primary/10 text-primary": isActive?.(percentage) },
          )}
          onClick={() => onValueChange?.(percentage)}
        >
          {percentage === 100 ? "Max" : percentage + "%"}
        </button>
      ))}
    </div>
  );
};

type ValueNotionalProps = {
  type: SwapInputType;
  value: string;
  isStableCoin: boolean;
  className?: string;
};
const ValueNotional = ({
  type,
  value,
  isStableCoin,
  className,
}: ValueNotionalProps) => {
  const mid = useShallowSwapStore((s) => {
    if (!s.route || isStableCoin) return 1;
    if (s.route.mids.length > 1)
      return type === "sell" ? s.route.mids[0] : s.route.mids[1];
    return s.route.mids[0];
  });

  const convertedValue = parseFloat(value || "0") * mid;

  return (
    <p className={cn("text-xs font-medium text-neutral-gray-400", className)}>
      {formatNumber(convertedValue, {
        style: "currency",
      })}
    </p>
  );
};

export default SwapInput;
