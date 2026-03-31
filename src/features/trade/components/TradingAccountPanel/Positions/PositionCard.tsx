import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { ROUTES } from "@/lib/constants/routes";
import { Position, PositionAction } from "@/lib/types/trade";
import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import TokenImage from "@/components/common/TokenImage";
import { Button } from "@/components/ui/button";
import Tag from "@/components/ui/tag";
import { formatPriceToDecimal } from "@/features/trade/utils";

import CardItem from "../CardItem";

type Props = {
  data: Position;
  onActionClick: (position: Position, action: PositionAction) => void;
};
const PositionCard = ({ data, onActionClick }: Props) => {
  const unrealizedPnl = Number(data.unrealizedPnl);
  const returnOnEquity = Number(data.returnOnEquity);

  const pnlLabel = formatNumber(unrealizedPnl, {
    style: "currency",
    useSign: true,
  });

  const roeLabel = `(${formatNumber(returnOnEquity, {
    style: "percent",
    useSign: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })})`;

  const netFunding = -Number(data.cumFunding.sinceOpen);

  return (
    <div className="w-full p-3 bg-neutral-gray-600 rounded-lg">
      <div className="flex items-center justify-between gap-x-4 mb-1">
        <div className="flex items-center gap-x-1">
          <div className="flex items-center gap-x-1 mr-1">
            <TokenImage
              name={data.base}
              className="size-4"
              instrumentType="perps"
            />
            <Link
              href={`${ROUTES.trade.perps}/${data.coin}`}
              className="text-sm text-neutral-gray-100 font-medium line-clamp-1"
            >
              {data.base}
            </Link>
          </div>
          {data.dex && <Tag value={data.dex} />}
          <Tag
            value={data.isLong ? "Long" : "Short"}
            className={cn("text-buy bg-buy/10", {
              "text-sell bg-sell/10": !data.isLong,
            })}
          />
          <Tag
            value={`${data.leverage.value}x ${data.leverage.type}`}
            className={cn("text-buy bg-buy/10 capitalize", {
              "text-sell bg-sell/10": !data.isLong,
            })}
          />
        </div>
      </div>

      <div className="w-full grid grid-cols-4 gap-2 text-sm">
        <CardItem
          label="Position Value"
          value={formatNumber(Number(data.positionValue), {
            style: "currency",
          })}
        />
        <CardItem
          label="Entry Price"
          value={formatPriceToDecimal(Number(data.entryPx), data.pxDecimals)}
        />
        <CardItem
          label="Mark Price"
          value={formatPriceToDecimal(Number(data.markPx), data.pxDecimals)}
        />
        <CardItem
          label="PnL (ROE %)"
          value={`${pnlLabel}${roeLabel}`}
          className={cn("text-buy", {
            "text-sell": unrealizedPnl < 0,
          })}
        />
        <CardItem
          label={
            <div
              className="flex items-center gap-x-0.5"
              onClick={() =>
                data.leverage.type === "isolated" &&
                onActionClick(data, "margin")
              }
            >
              <span>Margin</span>
              {data.leverage.type === "isolated" && (
                <ChevronRight className="size-3" />
              )}
            </div>
          }
          value={formatNumber(Number(data.marginUsed), {
            style: "currency",
            useFallback: true,
          })}
        />
        <CardItem
          label="Funding"
          className={cn("text-buy", {
            "text-sell": netFunding < 0,
          })}
          value={formatNumber(netFunding, {
            style: "currency",
            useFallback: true,
            useSign: true,
            maximumFractionDigits: 5,
          })}
        />
        <CardItem
          label="Liq. Price"
          value={formatNumber(Number(data.liquidationPx || "0"), {
            useFallback: true,
          })}
          className="last:items-start"
        />
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="h-7 text-xs text-white"
          label="Close Position"
          onClick={() => onActionClick(data, "close")}
        />
        <Button
          variant="secondary"
          size="sm"
          className="h-7 text-xs text-white"
          label="Reverse"
          onClick={() => onActionClick(data, "reverse")}
        />
        <Button
          variant="secondary"
          size="sm"
          className="h-7 text-xs text-white"
          label="TP/SL"
          onClick={() => onActionClick(data, "tpsl")}
        />
      </div>
    </div>
  );
};

export default PositionCard;
