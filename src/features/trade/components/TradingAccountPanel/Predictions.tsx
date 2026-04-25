import { useMemo } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";

import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import { useIsMobile } from "@/hooks/useIsMobile";
import TokenImage from "@/components/common/TokenImage";
import Visibility from "@/components/common/Visibility";
import AdaptiveDataTable from "@/components/ui/adaptive-datatable";
import { Button } from "@/components/ui/button";
import Tag from "@/components/ui/tag";
import { usePredictionsMetas } from "@/features/predict/hooks/usePredictionsMetas";
import { mapCoinToMarketEventSpec } from "@/features/predict/lib/utils/mapper";
import { buildSideAssetId } from "@/features/predict/lib/utils/outcomes";
import { useAccountSpotBalances } from "@/features/trade/hooks/useAccountBalances";

import CloseAllPositions from "./ClosePositionModals/CloseAllPositions";
import ClosePosition from "./ClosePositionModals/ClosePosition";

type Prediction = {
  assetId: number;
  title: string;
  slug: string;
  underlying?: string;
  outcome: number;
  sideIndex: number;
  sideName: string;
  szi: string;
  midPx: string;
  entryPx: string;
  markPx: string;
  questionTitle?: string;
  positionValue: number;
  returnOnEquity: number;
  unrealizedPnl: number;
  pxDecimals: number;
  szDecimals: number;
  isLong: boolean;
};

const columns: ColumnDef<Prediction>[] = [
  {
    id: "market",
    header: "Market",
    accessorFn: (row) => row.title,
    cell({ row: { original } }) {
      return (
        <div className="flex flex-col">
          <Link
            href={`${ROUTES.predict.event}/${original.slug}`}
            className="font-medium hover:underline space-x-1"
          >
            {original.questionTitle && (
              <span className="text-xs text-neutral-gray-400 line-clamp-1">
                {original.questionTitle}
              </span>
            )}
            <span>{original.title}</span>
          </Link>
          <div className="flex items-center gap-1 mt-1">
            <Tag
              className={cn("bg-buy/10 text-buy space-x-1", {
                "bg-sell/10 text-sell": original.sideIndex === 1,
              })}
            >
              <span>{original.sideName}</span>
              <span>
                {formatNumber(Number(original.entryPx), {
                  style: "cent",
                })}
              </span>
            </Tag>
            <p className="text-xs space-x-1 text-neutral-gray-400">
              <span>{formatNumber(Number(original.szi))}</span>
              <span>shares</span>
            </p>
          </div>
        </div>
      );
    },
  },
  {
    id: "positionValue",
    header: "Position Value",
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
    id: "entryPrice",
    header: "Avg",
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
    id: "markPrice",
    header: "Current",
    cell({ row: { original } }) {
      return (
        <span>
          {formatNumber(Number(original.markPx), {
            style: "cent",
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
    id: "closeAll",
    header({ table }) {
      const predictions = (
        table.options.meta as unknown as { predictions: Prediction[] }
      )?.predictions;

      return (
        <CloseAllPositions variant="predictions" positions={predictions} />
      );
    },
    cell({ row: { original } }) {
      return (
        <ClosePositionButton data={original}>
          <p className="text-primary text-xs font-medium cursor-pointer">
            Close
          </p>
        </ClosePositionButton>
      );
    },
  },
];

const Predictions = () => {
  const isMobile = useIsMobile();

  const { data: predictionsMetas, isLoading } = usePredictionsMetas();

  const { predictions } = useAccountSpotBalances({ variant: "predictions" });

  const data = useMemo<Prediction[]>(() => {
    if (!predictions) return [];

    const markets = [];

    for (const prediction of predictions) {
      const outcomeMeta = mapCoinToMarketEventSpec(
        prediction.coin,
        predictionsMetas,
      );

      if (!outcomeMeta) continue;

      markets.push({
        assetId: buildSideAssetId(outcomeMeta.outcome, outcomeMeta.sideIndex),
        title: outcomeMeta.title,
        underlying: outcomeMeta.recurringPayload?.underlying,
        questionTitle: outcomeMeta.question?.name,
        slug: outcomeMeta.slug,
        outcome: outcomeMeta.outcome,
        sideIndex: outcomeMeta.sideIndex,
        sideName: outcomeMeta.sideName,
        szi: prediction.shares.toString(),
        entryPx: prediction.entryPx.toString(),
        markPx: prediction.markPx.toString(),
        midPx: prediction.midPx.toString(),
        pxDecimals: outcomeMeta.pxDecimals,
        szDecimals: outcomeMeta.szDecimals,
        positionValue: prediction.positionValue,
        returnOnEquity: prediction.returnOnEquity,
        unrealizedPnl: prediction.unrealizedPnl,
        isLong: true,
      });
    }

    return markets;
  }, [predictions, predictionsMetas]);

  return (
    <div className="w-full">
      <Visibility visible={isMobile && !!data.length}>
        <div className="w-full flex justify-end py-2 px-4">
          <CloseAllPositions variant="predictions" positions={data} />
        </div>
      </Visibility>
      <AdaptiveDataTable
        columns={columns}
        data={data}
        loading={isLoading}
        disablePagination
        meta={{
          predictions: data,
        }}
        className="space-y-1 md:space-y-1.5 mb-3"
        wrapperClassName="px-2 md:p-0"
        thClassName="h-8 py-0 font-medium text-xs"
        rowClassName="text-xs font-medium whitespace-nowrap py-0"
        rowCellClassName="py-1"
        render={(entry) => <PredictionCard data={entry} />}
        noData={
          <div className="flex flex-col items-center justify-center py-4 gap-y-3">
            <div className="text-center">
              <p className="text-white text-base font-medium">
                No predictions yet
              </p>
              <p className="text-neutral-gray-400 text-sm">
                Prediction markets will appear here once you start trading
              </p>
            </div>
            <Button
              asChild
              variant="default"
              size="sm"
              className="w-fit text-sm"
            >
              <Link prefetch href={ROUTES.predict.index}>
                Explore Markets
              </Link>
            </Button>
          </div>
        }
      />
    </div>
  );
};

type PredictionCardProps = {
  data: Prediction;
};

const PredictionCard = ({ data }: PredictionCardProps) => {
  return (
    <div className="w-full p-3 bg-neutral-gray-600 rounded-lg">
      <div className="flex items-center justify-between gap-x-4 mb-1.5">
        <div className="flex flex-col">
          <div className="flex items-center gap-x-1 mr-1">
            <Visibility visible={!!data.underlying}>
              <TokenImage
                name={data.underlying!}
                className="size-8 rounded-lg"
                instrumentType="spot"
              />
            </Visibility>
            <p className="text-sm text-neutral-gray-100 font-medium line-clamp-2">
              {data.questionTitle && (
                <span className="text-xs text-neutral-gray-400 line-clamp-1">
                  {data.questionTitle}
                </span>
              )}
              <span>{data.title}</span>
            </p>
          </div>
          <div className="flex items-center gap-1 mt-1">
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
              <span>{formatNumber(Number(data.szi))}</span>
              <span>shares</span>
            </p>
          </div>
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

      <ClosePositionButton data={data}>
        <Button
          variant="secondary"
          size="sm"
          className="h-7 text-xs text-white"
          label="Close"
        />
      </ClosePositionButton>
    </div>
  );
};

const ClosePositionButton = ({
  data,
  children,
}: {
  data: Prediction;
  children: React.ReactNode;
}) => {
  return (
    <ClosePosition
      variant="predictions"
      position={data}
      title={
        <div className="flex flex-col">
          <p className="text-white font-medium text-sm">Close Position</p>
          {data.questionTitle && (
            <p className="text-xs text-neutral-gray-400 line-clamp-1 mt-1 font-medium">
              {data.questionTitle}
            </p>
          )}
          <p
            className={cn(
              "text-sm text-neutral-gray-400 line-clamp-2 mt-1 font-normal",
              { "text-white": !!data.questionTitle },
            )}
          >
            {data.title}
          </p>
        </div>
      }
      trigger={children}
    />
  );
};

export default Predictions;
