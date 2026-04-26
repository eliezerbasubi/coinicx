import { useMemo } from "react";

import { useShallowInstrumentStore } from "@/lib/store/trade/instrument";
import { useShallowUserTradeStore } from "@/lib/store/trade/user-trade";
import { Position } from "@/lib/types/trade";
import { useIsMobile } from "@/hooks/useIsMobile";
import Visibility from "@/components/common/Visibility";
import AdaptiveDataTable from "@/components/ui/adaptive-datatable";
import { useAssetMetas } from "@/features/trade/hooks/useAssetMetas";
import {
  buildPerpAssetId,
  getPriceDecimals,
  parseBuilderDeployedAsset,
} from "@/features/trade/utils";
import { isStopLoss, isTakeProfit } from "@/features/trade/utils/orderTypes";

import CloseAllPositions from "../ClosePositionModals/CloseAllPositions";
import { POSITION_COLUMNS } from "./Columns";
import PositionCard from "./PositionCard";

const Positions = () => {
  const isMobile = useIsMobile();
  const { perpMetas, spotMeta } = useAssetMetas();
  const { positions, openOrders } = useShallowUserTradeStore((s) => ({
    positions: s.allDexsClearinghouseState?.assetPositions,
    openOrders: s.openOrders,
  }));

  const allDexsAssetCtxs = useShallowInstrumentStore((s) => s.allDexsAssetCtxs);

  const hasAssetPositions = !!positions?.length;

  const perpsToTpslOrders = useMemo(() => {
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
        <div className="w-full flex md:hidden justify-end pt-2 px-4">
          <CloseAllPositions positions={data} />
        </div>
      </Visibility>
      <AdaptiveDataTable
        columns={POSITION_COLUMNS}
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
        className="space-y-1 md:space-y-1.5 mb-3"
        wrapperClassName="p-2 md:p-0"
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

export default Positions;
