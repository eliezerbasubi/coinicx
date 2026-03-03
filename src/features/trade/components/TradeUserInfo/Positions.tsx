import { useMemo } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Pen } from "lucide-react";

import { AssetPosition } from "@/types/trade";
import AdaptiveDataTable from "@/components/ui/adaptive-datatable";
import { Button } from "@/components/ui/button";
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
  return (
    <div className="flex gap-2 items-center py-1 px-4 last:pb-0">
      <div className="flex-1 flex items-center gap-4">
        <div className="size-9 relative">
          <TokenImage
            key={data.coin}
            name={data.coin}
            instrumentType="perps"
            className="size-9 rounded-full overflow-hidden"
          />
        </div>
        <div className="flex-1 text-sm">
          <p className="text-white font-medium flex items-center">
            {data.coin}
          </p>
          <p className="text-xs text-neutral-gray-400 font-medium mt-1">
            <span>
              {formatNumber(Number(data.entryPx), {
                minimumFractionDigits: 2,
                roundingMode: "trunc",
              })}
              <span className="ml-1">
                <span className="mr-1">≈</span>
                {formatNumber(Number(data.markPx), {
                  minimumFractionDigits: 2,
                  style: "currency",
                })}
              </span>
            </span>
          </p>
        </div>
      </div>

      <div className="flex-1 text-right">
        <Button
          variant="secondary"
          size="sm"
          className="h-6 w-fit font-medium text-xs md:text-[13px] rounded-md px-3"
          label="Transfer"
        />
      </div>
    </div>
  );
};

export default Positions;
