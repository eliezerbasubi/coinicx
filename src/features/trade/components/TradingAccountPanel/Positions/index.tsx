import { CSSProperties, useMemo } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Pen } from "lucide-react";

import { Position } from "@/types/trade";
import { useIsMobile } from "@/hooks/useIsMobile";
import Visibility from "@/components/common/Visibility";
import AdaptiveDataTable from "@/components/ui/adaptive-datatable";
import { Button } from "@/components/ui/button";
import Tag from "@/components/ui/tag";
import { ROUTES } from "@/constants/routes";
import TokenImage from "@/features/trade/components/TokenImage";
import { useMetaAndAssetCtxs } from "@/features/trade/hooks/useMetaAndAssetCtxs";
import {
  buildPerpAssetId,
  formatPriceToDecimal,
  getPriceDecimals,
  parseBuilderDeployedAsset,
} from "@/features/trade/utils";
import { isStopLoss, isTakeProfit } from "@/features/trade/utils/orderTypes";
import { useShallowInstrumentStore } from "@/store/trade/instrument";
import { usePreferencesStore } from "@/store/trade/user-preferences";
import { useShallowUserTradeStore } from "@/store/trade/user-trade";
import { cn } from "@/utils/cn";
import { formatNumber } from "@/utils/formatting/numbers";

import CardItem from "../CardItem";
import CoinLink from "../CoinLink";
import CloseAllPositions from "./CloseAllPositions";
import ClosePosition from "./ClosePosition";
import ReversePosition from "./ReversePosition";
import TriggerPrice from "./TriggerPrice";

const columns: ColumnDef<Position>[] = [
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
        <span className="space-x-1">
          <span>
            {formatNumber(Number(original.marginUsed), {
              style: "currency",
              useFallback: true,
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
          {formatNumber(Number(original.cumFunding.allTime), {
            style: "currency",
            useFallback: true,
          })}
        </span>
      );
    },
  },
  {
    id: "closeAll",
    header({ table }) {
      const positions = (
        table.options.meta as unknown as { positions: Position[] }
      )?.positions;

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

const Positions = () => {
  const isMobile = useIsMobile();

  const { perpMetas, spotMeta } = useMetaAndAssetCtxs();
  const { positions, openOrders } = useShallowUserTradeStore((s) => ({
    positions: s.allDexsClearinghouseState?.assetPositions,
    openOrders: s.openOrders,
  }));

  const allDexsAssetCtxs = useShallowInstrumentStore((s) => s.allDexsAssetCtxs);

  const hasAssetPositions = !!positions?.length;

  const perpsToTpslOrders = useMemo(() => {
    // Skip computation if there are no positions
    if (!hasAssetPositions) return;

    const map = new Map<string, { tpPrice: string; slPrice: string }>();
    if (!openOrders.length) return map;

    for (const order of openOrders) {
      // Exclude spot
      if (
        order.coin.startsWith("@") ||
        order.coin === "PURR/USDC" ||
        !order.reduceOnly
      ) {
        continue;
      } else {
        const payload = {
          tpPrice: isTakeProfit(order.orderType) ? order.triggerPx : "",
          slPrice: isStopLoss(order.orderType) ? order.triggerPx : "",
        };

        if (map.has(order.coin)) {
          const data = map.get(order.coin)!;
          map.set(order.coin, {
            tpPrice: data.tpPrice || payload.tpPrice,
            slPrice: data.slPrice || payload.slPrice,
          });
        } else {
          map.set(order.coin, payload);
        }
      }
    }

    return map;
  }, [openOrders, hasAssetPositions]);

  const perpsTokensToInfo = useMemo(() => {
    const map = new Map<
      string,
      {
        universeIndex: number;
        quote: string;
        szDecimals: number;
        assetId: number;
      }
    >();

    if (!perpMetas) return map;

    for (
      let perpDexIndex = 0;
      perpDexIndex < perpMetas.length;
      perpDexIndex++
    ) {
      const perpMeta = perpMetas[perpDexIndex];
      const meta = perpMeta.universe;

      for (let index = 0; index < meta.length; index++) {
        const universe = meta[index];

        const spotAsset = spotMeta?.tokens?.[perpMeta.collateralToken];

        // Skip if the collateral asset is not supported
        if (!spotAsset) continue;

        map.set(universe.name, {
          universeIndex: index,
          quote: spotAsset.name ?? "USDC",
          szDecimals: universe.szDecimals,
          assetId: buildPerpAssetId({ perpDexIndex, universeIndex: index }),
        });
      }
    }

    return map;
  }, [perpMetas, spotMeta]);

  const data = useMemo<Position[]>(() => {
    if (!positions) return [];

    const dexCtxStates = new Map(allDexsAssetCtxs);

    const assetPositions: Position[] = [];

    for (const datum of positions) {
      const position = datum.position;
      const asset = parseBuilderDeployedAsset(position.coin);
      const dexCtxState = dexCtxStates.get(asset.dex);

      const info = perpsTokensToInfo.get(position.coin);
      const tpslInfo = perpsToTpslOrders?.get(position.coin);

      if (!dexCtxState || !info) continue;

      const ctx = dexCtxState[info.universeIndex];

      assetPositions.push({
        ...position,
        dex: asset.dex,
        base: asset.base,
        quote: info.quote,
        markPx: ctx.markPx,
        midPx: ctx.midPx || "0",
        szDecimals: info.szDecimals,
        pxDecimals: getPriceDecimals(
          Number(ctx.markPx),
          info.szDecimals,
          false,
        ),
        tpPrice: tpslInfo?.tpPrice ?? null,
        slPrice: tpslInfo?.slPrice ?? null,
        assetId: info.assetId,
        isLong: Number(position.szi) > 0,
      });
    }

    return assetPositions;
  }, [positions, allDexsAssetCtxs, perpsTokensToInfo, perpsToTpslOrders]);

  return (
    <div className="w-full">
      <Visibility visible={isMobile && !!data.length}>
        <div className="w-full flex justify-end py-2 px-4">
          <CloseAllPositions positions={data} />
        </div>
      </Visibility>
      <AdaptiveDataTable
        columns={columns}
        data={data}
        meta={{
          // We're passing positions here so that we can grab them inside the header
          // Good for performance. Better than calling table.getRowModel().rows inside header
          positions: data,
        }}
        loading={false}
        initialState={{
          pagination: {
            pageIndex: 0,
            pageSize: 30,
          },
        }}
        className="space-y-1.5 mb-3"
        wrapperClassName="px-4 md:p-0"
        thClassName="h-8 py-0 font-medium text-xs"
        rowClassName="text-xs font-medium whitespace-nowrap py-0"
        rowCellClassName="py-1"
        render={(entry) => <PositionCard data={entry} />}
        noData="No open positions yet"
        disablePagination
      />
    </div>
  );
};

type PositionCardProps = {
  data: Position;
};

const PositionCard = ({ data }: PositionCardProps) => {
  const unrealizedPnl = Number(data.unrealizedPnl);
  const returnOnEquity = Number(data.returnOnEquity);

  const pnlLabel = formatNumber(unrealizedPnl, {
    style: "currency",
    useSign: true,
  });

  const roeLabel = `(${formatNumber(returnOnEquity, {
    style: "percent",
    useSign: true,
  })})`;

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
          value={`${pnlLabel} ${roeLabel}`}
          className={cn("text-buy", {
            "text-sell": unrealizedPnl < 0,
          })}
        />
        <CardItem
          label="Margin"
          value={formatNumber(Number(data.marginUsed), {
            style: "currency",
            useFallback: true,
          })}
        />
        <CardItem
          label="Funding"
          value={formatNumber(Number(data.cumFunding.allTime), {
            style: "currency",
            useFallback: true,
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
        <ClosePosition
          position={data}
          trigger={
            <Button
              variant="secondary"
              size="sm"
              className="h-7 text-xs text-white"
              label="Close Position"
            />
          }
        />
        <ReversePosition
          position={data}
          trigger={
            <Button
              variant="secondary"
              size="sm"
              className="h-7 text-xs text-white"
              label="Reverse"
            />
          }
        />
        <TriggerPrice
          position={data}
          trigger={
            <Button
              variant="secondary"
              size="sm"
              className="h-7 text-xs text-white"
              label="TP/SL"
            />
          }
        />
      </div>
    </div>
  );
};

export default Positions;
