import React from "react";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import TokenImage from "@/components/common/TokenImage";

import { DIRECT_SWAP_FEE } from "../constants";
import { useShallowSwapStore } from "../store";

const ReviewSummary = () => {
  const summary = useShallowSwapStore((s) => ({
    insufficientLiquidity: !!s.route?.insufficientLiquidity,
    impact: s.route?.impact ?? 5,
    fee: s.route?.fee ?? DIRECT_SWAP_FEE,
    rate: s.route?.rate,
    path: s.route?.path,
    sellTokenName: s.sellToken?.name,
    buyTokenName: s.buyToken?.name,
  }));

  const routeImpact = Number(summary?.impact ?? 0);

  return (
    <div className="w-full rounded-xl bg-neutral-gray-600 p-4 space-y-2">
      <Tile
        label="Rate"
        value={
          summary.rate && summary.buyTokenName && summary.sellTokenName
            ? `1 ${summary.sellTokenName} = ${summary.rate.toFixed(6)} ${summary.buyTokenName}`
            : "--"
        }
      />
      <Tile
        label="Price Impact"
        value={formatImpact(routeImpact) + "%"}
        valueClassName={cn("text-buy", {
          "text-sell": routeImpact > 2,
          "text-yellow-500": summary.insufficientLiquidity || routeImpact > 1,
        })}
      />
      <Tile
        label="Fee"
        value={formatNumber(summary.fee / 100, {
          style: "percent",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      />
      <Tile
        label="Route"
        value={
          <div className="flex items-center gap-x-1">
            {summary.path?.map((token) => (
              <React.Fragment key={token}>
                <div className="flex items-center gap-1.5">
                  <TokenImage
                    key={token}
                    name={token}
                    instrumentType="spot"
                    className="size-4"
                  />
                  <p className="text-xs text-white">{token}</p>
                </div>
                <ChevronRight className="last:hidden size-4 text-neutral-gray-400" />
              </React.Fragment>
            ))}
          </div>
        }
      />
    </div>
  );
};

type TileProps = {
  label: React.ReactNode;
  value: React.ReactNode;
  className?: string;
  valueClassName?: string;
};
const Tile = ({ label, value, className, valueClassName }: TileProps) => {
  return (
    <div className={cn("flex items-center justify-between text-sm", className)}>
      <div className="text-neutral-gray-400 font-normal">{label}</div>
      <div
        className={cn(
          "text-white font-medium lining-nums tabular-nums",
          valueClassName,
        )}
      >
        {value}
      </div>
    </div>
  );
};

function formatImpact(value: number, decimals = 2): string {
  const normalized = Math.abs(value) < 1e-8 ? 0 : value;
  return normalized.toFixed(decimals);
}

export default ReviewSummary;
