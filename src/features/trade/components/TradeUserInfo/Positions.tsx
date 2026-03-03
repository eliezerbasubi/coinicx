import { useMemo } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Pen } from "lucide-react";

import { AssetPosition } from "@/types/trade";
import AdaptiveDataTable from "@/components/ui/adaptive-datatable";
import { Button } from "@/components/ui/button";
import Tag from "@/components/ui/tag";
import { ROUTES } from "@/constants/routes";
import { useMetaAndAssetCtxs } from "@/features/trade/hooks/useMetaAndAssetCtxs";
import { parseBuilderDeployedAsset } from "@/features/trade/utils";
import { useShallowInstrumentStore } from "@/store/trade/instrument";
import { useShallowUserTradeStore } from "@/store/trade/user-trade";
import { cn } from "@/utils/cn";
import {
  formatNumber,
  formatNumberWithFallback,
} from "@/utils/formatting/numbers";

import TokenImage from "../TokenImage";
import CardItem from "./CardItem";

type Position = AssetPosition["position"] & { markPx: string };

const columns: ColumnDef<Position>[] = [
  {
    header: "Coin",
    accessorFn: (row) => row.coin,
    cell({ row: { original } }) {
      return (
        <Link
          href={`${ROUTES.trade.perps}/${original.coin}`}
          className="font-medium space-x-1 hover:text-primary"
        >
          {original.coin}
        </Link>
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
          {formatNumber(Number(original.entryPx), { style: "currency" })}
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
          {formatNumber(Number(original.markPx), { style: "currency" })}
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
      const sign = unrealizedPnl > 0 && "+";

      return (
        <span
          className={cn("space-x-1 text-buy", {
            "text-sell": unrealizedPnl < 0,
          })}
        >
          <span>
            {sign}
            {formatNumber(unrealizedPnl, {
              style: "currency",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          <span>
            ({sign}
            {formatNumber(returnOnEquity, {
              style: "percent",
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
          {formatNumberWithFallback(Number(original.liquidationPx || "0"))}
        </span>
      );
    },
  },
  {
    id: "margin",
    header: "Margin",
    cell({ row: { original } }) {
      return (
        <span className="space-x-1">
          <span>
            {formatNumberWithFallback(Number(original.marginUsed), {
              style: "currency",
            })}
          </span>
          <span className="capitalize">({original.leverage.type})</span>
        </span>
      );
    },
  },
  {
    id: "funding",
    header: "Funding",
    cell({ row: { original } }) {
      return (
        <span>
          {formatNumberWithFallback(Number(original.cumFunding.allTime), {
            style: "currency",
          })}
        </span>
      );
    },
  },
  {
    id: "closeAll",
    header() {
      return (
        <button type="button" className="text-primary text-xs font-medium">
          Close All
        </button>
      );
    },
    cell() {
      return (
        <button type="button" className="text-primary text-xs font-medium">
          Close
        </button>
      );
    },
  },
  {
    id: "tpsl",
    header: "TP/SL",
    cell() {
      return (
        <div className="flex items-center gap-x-1">
          <p>--/--</p>
          <Pen className="size-4 text-primary" />
        </div>
      );
    },
  },
];

const Positions = () => {
  const { perpMetas } = useMetaAndAssetCtxs();
  const { positions } = useShallowUserTradeStore((s) => ({
    positions: s.allDexsClearinghouseState?.assetPositions,
  }));

  const allDexsAssetCtxs = useShallowInstrumentStore((s) => s.allDexsAssetCtxs);

  const perpsTokensToUniverseIndex = useMemo(() => {
    const map = new Map<string, number>();

    if (!perpMetas) return map;

    for (const perpMeta of perpMetas) {
      const meta = perpMeta.universe;

      for (let index = 0; index < meta.length; index++) {
        const universe = meta[index];
        map.set(universe.name, index);
      }
    }

    return map;
  }, [perpMetas]);

  const data = useMemo(() => {
    if (!positions) return [];

    const dexCtxStates = new Map(allDexsAssetCtxs);

    const assetPositions = [];

    for (const datum of positions) {
      const position = datum.position;
      const asset = parseBuilderDeployedAsset(position.coin);
      const dexCtxState = dexCtxStates.get(asset.dex);

      if (!dexCtxState) continue;

      const universeIndex = perpsTokensToUniverseIndex.get(position.coin);

      if (!universeIndex) continue;

      const ctx = dexCtxState[universeIndex];

      assetPositions.push({
        ...position,
        markPx: ctx.markPx,
      });
    }

    return assetPositions;
  }, [positions, allDexsAssetCtxs, perpsTokensToUniverseIndex]);

  return (
    <AdaptiveDataTable
      columns={columns}
      data={data}
      loading={false}
      className="space-y-1.5 mb-3"
      thClassName="h-8 py-0 font-medium text-xs"
      rowClassName="text-xs font-medium whitespace-nowrap py-0"
      rowCellClassName="py-1"
      render={(entry) => <PositionCard data={entry} />}
      noData="No open positions yet"
      disablePagination
    />
  );
};

type PositionCardProps = {
  data: Position;
};

const PositionCard = ({ data }: PositionCardProps) => {
  const asset = parseBuilderDeployedAsset(data.coin);
  const isLong = Number(data.szi) > 0;
  const unrealizedPnl = Number(data.unrealizedPnl);
  const returnOnEquity = Number(data.returnOnEquity);
  const pnlSign = (unrealizedPnl > 0 && "+") || "";

  const pnlLabel = `${pnlSign}${formatNumber(unrealizedPnl, {
    style: "currency",
  })}`;

  const roeLabel = `(${pnlSign}${formatNumber(returnOnEquity, {
    style: "percent",
  })})`;

  return (
    <div className="w-full p-3 bg-neutral-gray-600 rounded-lg">
      <div className="flex items-center justify-between gap-x-4 mb-1">
        <div className="flex items-center gap-x-1">
          <div className="flex items-center gap-x-1 mr-1">
            <TokenImage
              name={asset.base}
              className="size-4"
              instrumentType="perps"
            />
            <Link
              href={`${ROUTES.trade.perps}/${data.coin}`}
              className="text-sm text-neutral-gray-100 font-medium line-clamp-1"
            >
              {asset.base}
            </Link>
          </div>
          {asset.dex && <Tag value={asset.dex} />}
          <Tag
            value={isLong ? "Long" : "Short"}
            className={cn("text-buy bg-buy/10", {
              "text-sell bg-sell/10": !isLong,
            })}
          />
          <Tag
            value={`${data.leverage.value}x ${data.leverage.type}`}
            className={cn("text-buy bg-buy/10 capitalize", {
              "text-sell bg-sell/10": !isLong,
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
          value={formatNumber(Number(data.entryPx), { style: "currency" })}
        />
        <CardItem
          label="PnL (ROE %)"
          value={`${pnlLabel} ${roeLabel}`}
          className={cn("text-buy", {
            "text-sell": unrealizedPnl < 0,
          })}
        />
        <CardItem
          label="Margin"
          value={formatNumberWithFallback(Number(data.marginUsed), {
            style: "currency",
          })}
        />
        <CardItem
          label="Funding"
          value={formatNumberWithFallback(Number(data.cumFunding.allTime), {
            style: "currency",
          })}
        />
        <CardItem
          label="Liq. Price"
          value={formatNumberWithFallback(Number(data.liquidationPx || "0"))}
          className="last:items-start"
        />
      </div>

      <div className="mt-2">
        <Button
          variant="secondary"
          size="sm"
          className="h-7"
          label="Close Position"
        />
      </div>
    </div>
  );
};

export default Positions;
