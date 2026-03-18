import React, { useState } from "react";
import { ArrowDown } from "lucide-react";

import { Position } from "@/lib/types/trade";
import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import TradingButton from "@/components/common/TradingButton";
import AdaptiveDialog from "@/components/ui/adaptive-dialog";
import Tag from "@/components/ui/tag";
import { useReversePosition } from "@/features/trade/hooks/useReversePosition";
import { useFeeRate } from "@/features/trade/hooks/useUserFees";
import { formatPriceToDecimal } from "@/features/trade/utils";

type Props = {
  position: Position;
  trigger: React.ReactNode;
};

const ReversePosition = ({ position, trigger }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <AdaptiveDialog
      open={open}
      onOpenChange={setOpen}
      title={`Reverse Position (${position.base})`}
      trigger={trigger}
      className="gap-1"
    >
      <ReversePositionContent
        position={position}
        onSuccess={() => setOpen(false)}
      />
    </AdaptiveDialog>
  );
};

type ReversePositionContentProps = {
  position: Position;
  onSuccess?: () => void;
};

const ReversePositionContent = ({
  position,
  onSuccess,
}: ReversePositionContentProps) => {
  const { processing, reversePosition } = useReversePosition({ onSuccess });
  const feeRate = useFeeRate({ isMarket: true });

  const markPrice = Number(position.markPx);
  const currentSize = Math.abs(Number(position.szi));
  const reverseSize = currentSize * 2;
  const reverseSide = position.isLong ? "Short" : "Long";

  // Fees: closing current + opening reverse (both at current size)
  const closingValue = currentSize * markPrice;
  const openingValue = currentSize * markPrice;
  const totalFees = (closingValue + openingValue) * feeRate;

  return (
    <div className="w-full space-y-2">
      <div className="w-full flex items-center justify-between mt-2">
        <p className="text-xs text-neutral-gray-400 font-medium">
          Current Price
        </p>
        <p className="text-xs text-white font-medium">
          {formatPriceToDecimal(markPrice, position.pxDecimals)}
        </p>
      </div>

      <div className="relative flex flex-col gap-1">
        <PositionCard
          label="Current Position"
          side={position.isLong ? "Long" : "Short"}
          isLong={position.isLong}
          size={currentSize}
          entryPrice={formatPriceToDecimal(
            Number(position.entryPx),
            position.pxDecimals,
          )}
          leverage={position.leverage.value}
          coin={position.coin}
          className="bg-transparent border border-neutral-gray-200"
        />

        {/* Reverse Arrow */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="size-8 rounded-full bg-neutral-gray-200 border-3 border-primary-dark flex items-center justify-center">
            <ArrowDown className="size-4 text-neutral-gray-400" />
          </div>
        </div>

        <PositionCard
          label="New Position"
          side={reverseSide}
          isLong={!position.isLong}
          size={currentSize}
          entryPrice={formatPriceToDecimal(markPrice, position.pxDecimals)}
          leverage={position.leverage.value}
          coin={position.coin}
        />
      </div>

      {/* Summary */}
      <div className="w-full space-y-1 bg-neutral-gray-200 p-2 rounded-lg">
        <div className="w-full flex items-center justify-between">
          <p className="text-xs text-neutral-gray-400">Order Size</p>
          <p className="text-xs text-white font-medium">
            {reverseSize} {position.coin}
          </p>
        </div>
        <div className="w-full flex items-center justify-between">
          <p className="text-xs text-neutral-gray-400">Order Value</p>
          <p className="text-xs text-white font-medium">
            {formatNumber(reverseSize * markPrice, { style: "currency" })}
          </p>
        </div>
        <div className="w-full flex items-center justify-between">
          <p className="text-xs text-neutral-gray-400">Fees</p>
          <p className="text-xs text-white font-medium">
            {formatNumber(totalFees, { style: "currency" })}
          </p>
        </div>
      </div>

      <TradingButton
        label="Reverse Position"
        disabled={processing}
        loading={processing}
        onClick={() => reversePosition({ position })}
      />
    </div>
  );
};

type PositionCardProps = {
  label: string;
  side: string;
  isLong: boolean;
  size: number;
  entryPrice: string;
  leverage: number;
  coin: string;
  className?: string;
};

const PositionCard = ({
  label,
  side,
  isLong,
  size,
  entryPrice,
  leverage,
  coin,
  className,
}: PositionCardProps) => {
  return (
    <div
      className={cn(
        "w-full p-2 rounded-lg bg-neutral-gray-200 space-y-1",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs text-neutral-gray-400">{label}</p>
        <div className="flex items-center gap-x-1.5">
          <Tag
            value={side}
            className={cn("text-buy bg-buy/10", {
              "text-sell bg-sell/10": !isLong,
            })}
          />
          <Tag
            value={`${leverage}x`}
            className={cn("text-buy bg-buy/10", {
              "text-sell bg-sell/10": !isLong,
            })}
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-neutral-gray-400">Size</p>
        <p
          className={cn("text-xs font-medium text-buy", {
            "text-sell": !isLong,
          })}
        >
          {size} {coin}
        </p>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-neutral-gray-400">Entry Price</p>
        <p className="text-xs text-white font-medium">{entryPrice}</p>
      </div>
    </div>
  );
};

export default ReversePosition;
