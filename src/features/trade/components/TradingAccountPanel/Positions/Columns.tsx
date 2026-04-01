import { CSSProperties } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ChevronRight, Pen } from "lucide-react";

import { ROUTES } from "@/lib/constants/routes";
import { usePreferencesStore } from "@/lib/store/trade/user-preferences";
import { Position, PositionAction } from "@/lib/types/trade";
import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import { formatPriceToDecimal } from "@/features/trade/utils";

import CoinLink from "../CoinLink";
import AdjustIsolatedMargin from "./AdjustIsolatedMargin";
import CloseAllPositions from "./CloseAllPositions";
import ClosePosition from "./ClosePosition";
import ReversePosition from "./ReversePosition";
import TriggerPrice from "./TriggerPrice";

export type PositionTableMeta = {
  positions: Position[];
};

export const POSITION_COLUMNS: ColumnDef<Position>[] = [
  {
    header: "Coin",
    meta: {
      className: "p-0",
    },
    accessorFn: (row) => row.coin,
    cell({ row: { original } }) {
      const sideColor = original.isLong
        ? "var(--color-buy)"
        : "var(--color-sell";
      const sideBgColor = original.isLong
        ? "rgb(11, 50, 38)"
        : "rgb(59, 17, 23)";

      return (
        <div
          style={
            {
              "--side-color": sideColor,
              "--side-bg-color": sideBgColor,
            } as CSSProperties
          }
          className="w-full flex items-center gap-x-2 px-4 py-1 bg-[linear-gradient(90deg,var(--side-color)_0px,var(--side-color)_4px,var(--side-bg-color)_4px,transparent_100%)]"
        >
          <CoinLink
            dex={original.dex}
            href={`${ROUTES.trade.perps}/${original.coin}`}
            symbol={original.base}
          />

          <p
            className={cn("text-xs font-medium text-buy", {
              "text-sell": !original.isLong,
            })}
          >
            {original.leverage.value}x
          </p>
        </div>
      );
    },
  },
  {
    header: "Size",
    id: "size",
    accessorFn: (row) => row.szi,
    cell({ row: { original } }) {
      return (
        <div
          className={cn("flex items-center gap-1 text-buy", {
            "text-sell": Number(original.szi) < 0,
          })}
        >
          <p>{original.szi}</p>
        </div>
      );
    },
  },
  {
    id: "positionValue",
    header: "Position Value",
    cell({ row: { original } }) {
      return (
        <span>
          {formatNumber(Number(original.positionValue), { style: "currency" })}
        </span>
      );
    },
  },
  {
    id: "entryPrice",
    header: "Entry Price",
    cell({ row: { original } }) {
      return (
        <span>
          {formatPriceToDecimal(Number(original.entryPx), original.pxDecimals)}
        </span>
      );
    },
  },
  {
    id: "markPrice",
    header: "Mark Price",
    cell({ row: { original } }) {
      return (
        <span>
          {formatPriceToDecimal(Number(original.markPx), original.pxDecimals)}
        </span>
      );
    },
  },
  {
    id: "pnl",
    header: "PNL (ROE %)",
    cell({ row: { original } }) {
      const unrealizedPnl = Number(original.unrealizedPnl);
      const returnOnEquity = Number(original.returnOnEquity);

      return (
        <span
          className={cn("space-x-1 text-buy", {
            "text-sell": unrealizedPnl < 0,
          })}
        >
          <span>
            {formatNumber(unrealizedPnl, {
              style: "currency",
              useSign: true,
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          <span>
            (
            {formatNumber(returnOnEquity, {
              style: "percent",
              useSign: true,
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            )
          </span>
        </span>
      );
    },
  },
  {
    id: "liquidationPrice",
    header: "Liq. Price",
    cell({ row: { original } }) {
      return (
        <span>
          {formatNumber(Number(original.liquidationPx || "0"), {
            useFallback: true,
          })}
        </span>
      );
    },
  },
  {
    id: "margin",
    header: "Margin",
    cell({ row: { original } }) {
      return (
        <AdjustIsolatedMargin
          position={original}
          trigger={
            <div
              className={cn("space-x-0.5 flex items-center", {
                "underline decoration-dashed cursor-pointer":
                  original.leverage.type === "isolated",
              })}
            >
              <p>
                {formatNumber(Number(original.marginUsed), {
                  style: "currency",
                  useFallback: true,
                })}
              </p>
              <p className="capitalize">({original.leverage.type})</p>
              {original.leverage.type === "isolated" && (
                <ChevronRight className="size-3.5 stroke-3 text-neutral-gray-400" />
              )}
            </div>
          }
        />
      );
    },
  },
  {
    id: "funding",
    header: "Funding",
    cell({ row: { original } }) {
      // Calculates the net funding gain/loss for a position to display on the UI.
      // For a short position, a negative cumFunding.sinceOpen indicates funding received (gain),
      // while a positive value indicates funding paid (loss).
      const netFunding = -Number(original.cumFunding.sinceOpen);

      return (
        <span
          className={cn("text-buy", {
            "text-sell": netFunding < 0,
          })}
        >
          {formatNumber(netFunding, {
            style: "currency",
            useFallback: true,
            useSign: true,
            maximumFractionDigits: 5,
          })}
        </span>
      );
    },
  },
  {
    id: "closeAll",
    header({ table }) {
      const { positions } = table.options.meta as unknown as PositionTableMeta;

      return <CloseAllPositions positions={positions} />;
    },
    cell({ row: { original } }) {
      return (
        <div className="flex items-center gap-x-2">
          <ClosePosition
            position={original}
            trigger={
              <p className="text-primary text-xs font-medium cursor-pointer">
                Close
              </p>
            }
          />
          <ReversePosition
            position={original}
            trigger={
              <p className="text-primary text-xs font-medium cursor-pointer">
                Reverse
              </p>
            }
          />
        </div>
      );
    },
  },
  {
    id: "tpsl",
    header: "TP/SL",
    cell({ row: { original } }) {
      const formattedTpPrice = formatPriceToDecimal(
        Number(original.tpPrice || "0"),
        original.pxDecimals,
        { useFallback: true },
      );
      const formattedSlPrice = formatPriceToDecimal(
        Number(original.slPrice || "0"),
        original.pxDecimals,
        { useFallback: true },
      );

      return (
        <TriggerPrice
          position={original}
          trigger={
            <div className="flex items-center gap-x-1 cursor-pointer">
              <p
                onClick={(e) => {
                  e.preventDefault();

                  usePreferencesStore
                    .getState()
                    .dispatch({ activeTab: "openOrders" });
                }}
                className={cn({
                  "border-b border-transparent hover:border-primary hover:text-primary":
                    !!original.tpPrice || !!original.slPrice,
                })}
              >
                {formattedTpPrice}/{formattedSlPrice}
              </p>
              <Pen className="size-4 text-primary" />
            </div>
          }
        />
      );
    },
  },
];
