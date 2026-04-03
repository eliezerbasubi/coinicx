import { useMemo, useState } from "react";

import { Position } from "@/lib/types/trade";
import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import TradingButton from "@/components/common/TradingButton";
import AdaptiveDialog from "@/components/ui/adaptive-dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Summary, SummaryItem } from "@/components/ui/summary";
import { useClosePosition } from "@/features/trade/hooks/useClosePosition";
import { useFeeRate } from "@/features/trade/hooks/useUserFees";

type Props = {
  positions: Position[];
};

const CloseAllPositions = ({ positions }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <AdaptiveDialog
      open={open}
      onOpenChange={(open) => {
        if (!positions.length) return;
        setOpen(open);
      }}
      title={"Close all positions"}
      description={
        <span className="text-xs text-neutral-gray-400">
          This will close all your positions and cancel their associated TP/SL
          orders
        </span>
      }
      trigger={
        <p
          className={cn("text-primary text-xs font-medium cursor-pointer", {
            "text-neutral-gray-400": !positions.length,
          })}
        >
          Close All
        </p>
      }
      className="gap-1"
    >
      <CloseAllPositionContent
        positions={positions}
        onSuccess={() => setOpen(false)}
      />
    </AdaptiveDialog>
  );
};

type CloseAllPositionContentProps = {
  positions: Position[];
  onSuccess?: () => void;
};

const CloseAllPositionContent = ({
  positions,
  onSuccess,
}: CloseAllPositionContentProps) => {
  const [closeBy, setCloseBy] = useState<"market" | "limit">("market");

  const { processing, closePosition } = useClosePosition({ onSuccess });

  const isMarket = closeBy === "market";
  const feeRate = useFeeRate({ isMarket });

  const { totalPnl, totalFee } = useMemo(() => {
    let pnl = 0;
    let fee = 0;

    for (const position of positions) {
      const entryPrice = Number(position.entryPx);
      const closePrice = isMarket
        ? Number(position.markPx)
        : Number(position.midPx);
      const size = Math.abs(Number(position.szi));
      const closeValue = size * closePrice;

      const rawPnl = position.isLong
        ? (closePrice - entryPrice) * size
        : (entryPrice - closePrice) * size;

      pnl += rawPnl;
      fee += closeValue * feeRate.total;
    }

    return { totalPnl: pnl - fee, totalFee: fee };
  }, [positions, isMarket, feeRate]);

  return (
    <div className="w-full mt-3">
      <div className="space-y-1 mb-4">
        <p className="text-xs text-neutral-gray-400 font-medium">Close By</p>
        <RadioGroup
          value={closeBy}
          name="closeBy"
          defaultValue="market"
          onValueChange={(value) => setCloseBy(value as "market" | "limit")}
          className="w-full"
        >
          <div className="w-full flex items-center gap-2">
            <RadioGroupItem value="market" id="market" />
            <Label
              htmlFor="market"
              className="w-full cursor-pointer text-left flex flex-col items-start gap-1"
            >
              <p className="text-sm">Market</p>
              <p className="text-xs text-neutral-gray-400 font-normal">
                Each position will close at its current market price
              </p>
            </Label>
          </div>
          <div className="w-full flex items-center gap-2">
            <RadioGroupItem value="limit" id="limit" />
            <Label
              htmlFor="limit"
              className="w-full cursor-pointer text-left flex flex-col items-start gap-1"
            >
              <p className="text-sm">Limit</p>
              <p className="text-xs text-neutral-gray-400 font-normal">
                Each order will close at the current mid price
              </p>
            </Label>
          </div>
        </RadioGroup>
      </div>

      <Summary className="mb-2">
        <SummaryItem
          label="Estimated PNL"
          value={formatNumber(totalPnl, {
            style: "currency",
            useSign: true,
          })}
          valueClassName={cn("text-buy", {
            "text-sell": totalPnl < 0,
          })}
        />
        <SummaryItem
          label="Fees"
          value={formatNumber(totalFee, { style: "currency" })}
        />
      </Summary>

      <TradingButton
        label={"Confirm"}
        disabled={processing}
        loading={processing}
        onClick={() =>
          closePosition({
            positions,
            closeBy,
          })
        }
      />
    </div>
  );
};

export default CloseAllPositions;
