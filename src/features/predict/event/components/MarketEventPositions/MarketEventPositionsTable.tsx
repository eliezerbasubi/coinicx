import { useCallback, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";

import { useShallowInstrumentStore } from "@/lib/store/trade/instrument";
import { useOrderFormStore } from "@/lib/store/trade/order-form";
import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import AdaptiveDataTable from "@/components/ui/adaptive-datatable";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/datatable";
import Tag from "@/components/ui/tag";
import { useMarketEventContext } from "@/features/predict/lib/store/market-event/hooks";
import { useShallowUserPredictionStore } from "@/features/predict/lib/store/user-prediction";
import { MarketEventMetaOutcome } from "@/features/predict/lib/types";
import {
  convertBalanceCoinToSpotName,
  parseSideCoinFromCoin,
} from "@/features/predict/lib/utils/outcomes";

type Props = {
  className?: string;
  outcomeMeta: MarketEventMetaOutcome;
};

type MarketEventPosition = {
  coin: string;
  shares: number;
  midPx: string;
  entryPx: number;
  markPx: number;
  positionValue: number;
  returnOnEquity: number;
  unrealizedPnl: number;
  sideIndex: number;
  sideName: string;
};

const columns: ColumnDef<MarketEventPosition>[] = [
  {
    id: "outcome",
    header: "OUTCOME",
    accessorFn: (row) => row.coin,
    cell({ row: { original } }) {
      return (
        <Tag
          className={cn("bg-buy/10 text-buy space-x-1", {
            "bg-sell/10 text-sell": original.sideIndex === 1,
          })}
        >
          {original.sideName}
        </Tag>
      );
    },
  },
  {
    id: "quantity",
    header: "QTY",
    accessorFn: (row) => row.shares,
    cell({ row: { original } }) {
      return <span>{formatNumber(original.shares)}</span>;
    },
  },
  {
    id: "entryPrice",
    header: "AVG",
    cell({ row: { original } }) {
      return (
        <span>
          {formatNumber(Number(original.entryPx), {
            style: "cent",
          })}
        </span>
      );
    },
  },
  {
    id: "value",
    header: "VALUE",
    accessorFn: (row) => row.positionValue,
    cell({ row: { original } }) {
      return (
        <span>
          {formatNumber(original.positionValue, {
            style: "currency",
            roundingMode: "floor",
          })}
        </span>
      );
    },
  },
  {
    id: "pnlRoe",
    header: "PNL (ROE%)",
    cell({ row: { original } }) {
      return (
        <span
          className={cn("space-x-1 text-buy", {
            "text-sell": original.unrealizedPnl < 0,
          })}
        >
          <span>
            {formatNumber(original.unrealizedPnl, {
              style: "currency",
              useSign: true,
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          <span>
            (
            {formatNumber(original.returnOnEquity, {
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
    id: "actions",
    cell({ row, table }) {
      const { onSell } = table.options.meta as unknown as {
        onSell: (data: MarketEventPosition) => void;
      };

      return (
        <Button
          variant="secondary"
          size="sm"
          label="Sell"
          onClick={() => onSell?.(row.original)}
          className="text-sm hover:text-white"
        />
      );
    },
  },
];

const MarketEventPositionsTable = ({ className, outcomeMeta }: Props) => {
  const spotAssetCtxs = useShallowInstrumentStore((s) => s.spotAssetCtxs);
  const predictionBalances = useShallowUserPredictionStore(
    (s) => s.predictionBalances,
  );

  const getState = useMarketEventContext((s) => s.getState);

  const positions = useMemo(() => {
    const balances = predictionBalances.get(outcomeMeta.outcome);

    if (!balances) return [];

    const outcomePositions = [];

    for (const balance of balances) {
      const ctx = spotAssetCtxs[convertBalanceCoinToSpotName(balance.coin)];

      if (!ctx) continue;

      const shares = Number(balance.total);

      if (shares <= 0) continue;

      const parsedCoin = parseSideCoinFromCoin(balance.coin);

      if (!parsedCoin) continue;

      const sideIndex = parsedCoin.sideIndex;

      const markPx = Number(ctx.markPx);
      const entryNtl = Number(balance.entryNtl);

      const positionValue = shares * markPx;

      const hasEntryPx = entryNtl > 0;
      const pnl = hasEntryPx ? positionValue - entryNtl : 0;
      const roe = hasEntryPx ? pnl / entryNtl : 0;

      outcomePositions.push({
        coin: balance.coin,
        shares,
        midPx: ctx.midPx ?? "0",
        entryPx: hasEntryPx ? entryNtl / shares : 0,
        markPx,
        positionValue,
        returnOnEquity: roe,
        unrealizedPnl: pnl,
        sideName: outcomeMeta.sides[sideIndex].name,
        sideIndex,
      });
    }

    return outcomePositions;
  }, [spotAssetCtxs, predictionBalances, outcomeMeta.outcome]);

  const onSell = useCallback((data: MarketEventPosition) => {
    const { marketEventCtx, activeOutcomeIndex } = getState();

    const sidesCtx =
      marketEventCtx.outcomes[activeOutcomeIndex].sides ?? marketEventCtx.sides;
    const mid =
      sidesCtx[data.sideIndex].midPx || sidesCtx[data.sideIndex].markPx;

    const orderFormState = useOrderFormStore.getState();

    orderFormState.setOrderSide("sell");
    orderFormState.setExecutionOrder({
      size: data.shares.toString(),
      limitPrice: (mid * 100).toString(),
    });
    orderFormState.setPredictSideIndex(data.sideIndex);

    // Set isSzInNtl to false because we are setting size to shares which is not in notional
    orderFormState.setSettings({ isSzInNtl: false });
  }, []);

  return (
    <AdaptiveDataTable
      columns={columns}
      data={positions}
      meta={{
        onSell,
      }}
      className={cn("space-y-1 md:space-y-1.5 mb-3", className)}
      wrapperClassName="px-2 md:p-0"
      thClassName="h-8 py-0 font-medium text-xs"
      rowClassName="text-xs font-medium whitespace-nowrap py-0"
      rowCellClassName="py-1"
      noData="No positions found"
      render={(entry) => (
        <MarketEventPositionCard data={entry} onSell={onSell} />
      )}
    />
  );
};

interface MarketEventPositionCardProps {
  data: MarketEventPosition;
  onSell: (data: MarketEventPosition) => void;
}

const MarketEventPositionCard = ({
  data,
  onSell,
}: MarketEventPositionCardProps) => {
  const openTradingWidgetDrawer = useMarketEventContext(
    (s) => s.openTradingWidgetDrawer,
  );

  const handleOnSell = () => {
    onSell(data);
    openTradingWidgetDrawer(true, {
      resetOnMount: false,
    });
  };

  return (
    <div className="w-full p-3 bg-neutral-gray-600 rounded-lg">
      <div className="flex items-center justify-between gap-x-4 mb-1">
        <div className="flex flex-col gap-y-1">
          <Tag
            className={cn("bg-buy/10 text-buy space-x-1", {
              "bg-sell/10 text-sell": data.sideIndex === 1,
            })}
          >
            <span>{data.sideName}</span>
            <span>
              {formatNumber(Number(data.entryPx), {
                style: "cent",
                maximumFractionDigits: 1,
              })}
            </span>
          </Tag>
          <p className="text-xs space-x-1 text-neutral-gray-400 font-medium">
            <span>{formatNumber(data.shares)}</span>
            <span>shares</span>
          </p>
        </div>

        <div className="flex flex-col items-end">
          <p className="text-white text-sm font-medium">
            {formatNumber(data.positionValue, { style: "currency" })}
          </p>
          <p
            className={cn("space-x-1 text-buy text-xs", {
              "text-sell": data.unrealizedPnl < 0,
            })}
          >
            <span>
              {formatNumber(data.unrealizedPnl, {
                style: "currency",
                useSign: true,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span>
              (
              {formatNumber(data.returnOnEquity, {
                style: "percent",
                useSign: true,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              )
            </span>
          </p>
        </div>
      </div>

      <Button
        variant="secondary"
        size="sm"
        className="h-7 text-xs text-white"
        label="Sell"
        onClick={handleOnSell}
      />
    </div>
  );
};

export default MarketEventPositionsTable;
