import React, { useMemo } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";

import { useShallowUserTradeStore } from "@/lib/store/trade/user-trade";
import { ActiveTwap } from "@/lib/types/trade";
import { cn } from "@/lib/utils/cn";
import { formatDateTime } from "@/lib/utils/formatting/dates";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import { useIsMobile } from "@/hooks/useIsMobile";
import TokenImage from "@/components/common/TokenImage";
import Visibility from "@/components/common/Visibility";
import AdaptiveDataTable from "@/components/ui/adaptive-datatable";
import { Button } from "@/components/ui/button";
import Tag from "@/components/ui/tag";
import { useTerminateTwap } from "@/features/trade/hooks/useTerminateTwap";
import { formatTwapRuntime } from "@/features/trade/utils/twap";

import CardItem from "../CardItem";
import CoinLink from "../CoinLink";
import { useSpotToTokenDetails } from "../hooks/useSpotToTokenDetails";

const columns: ColumnDef<ActiveTwap>[] = [
  {
    header: "Coin",
    accessorFn: (row) => row.coin,
    cell({ row: { original } }) {
      return (
        <CoinLink
          symbol={original.symbol}
          dex={original.dex}
          href={original.href}
        />
      );
    },
  },
  {
    id: "size",
    header: "Size",
    cell({ row: { original } }) {
      return (
        <span>
          {formatNumber(Number(original.sz))} {original.base}
        </span>
      );
    },
  },
  {
    id: "executedSize",
    header: "Executed Size",
    cell({ row: { original } }) {
      return (
        <span className="text-buy">
          {formatNumber(Number(original.executedSz))} {original.base}
        </span>
      );
    },
  },
  {
    id: "averagePrice",
    header: "Average Price",
    cell({ row: { original } }) {
      return (
        <span className="text-buy">
          {formatNumber(original.averagePx, { useFallback: true })}
        </span>
      );
    },
  },
  {
    id: "runningTime",
    header: "Running Time / Total",
    cell({ row: { original } }) {
      return (
        <span>
          {formatTwapRuntime({
            totalMinutes: original.minutes,
            startTimestamp: original.timestamp,
            includeElapsed: true,
          })}
        </span>
      );
    },
  },
  {
    id: "reduceOnly",
    header: "Reduce Only",
    cell({ row: { original } }) {
      return <span>{original.reduceOnly ? "Yes" : "No"}</span>;
    },
  },
  {
    id: "creationTime",
    header: "Creation Time",
    cell({ row: { original } }) {
      return <span>{formatDateTime(original.timestamp)}</span>;
    },
  },
  {
    id: "terminateAll",
    header({ table }) {
      const activeTwaps = (
        table.options.meta as unknown as { activeTwaps: ActiveTwap[] }
      )?.activeTwaps;

      return (
        <TerminateTwapButton
          variant="ghost"
          activeTwaps={activeTwaps}
          label="Terminate All"
          className={cn("text-sell text-xs font-medium h-fit p-0", {
            "text-neutral-gray-400": !activeTwaps.length,
          })}
        />
      );
    },
    cell({ row: { original } }) {
      return (
        <TerminateTwapButton
          variant="ghost"
          activeTwaps={[original]}
          label="Terminate"
          className="text-sell text-xs font-medium h-fit p-0"
        />
      );
    },
  },
];

const ActiveTWAPs = () => {
  const isMobile = useIsMobile();
  const { isLoading, mapSpotNameToTokenDetails } = useSpotToTokenDetails();

  const twaps = useShallowUserTradeStore((s) => s.twapStates.twaps);

  const data = useMemo(() => {
    return Array.from(new Map(twaps)).map(([twapId, twap]) => {
      const tokenDetails = mapSpotNameToTokenDetails(twap.coin);
      const executedSz = Number(twap.executedSz);
      const avgPx = executedSz ? Number(twap.executedNtl) / executedSz : 0;

      return {
        twapId,
        timestamp: twap.timestamp,
        dex: tokenDetails.dex,
        base: tokenDetails.base,
        symbol: tokenDetails.symbol,
        coin: tokenDetails.coin,
        href: tokenDetails.href,
        isSpot: tokenDetails.isSpot,
        type: tokenDetails.type,
        averagePx: avgPx,
        side: twap.side,
        executedSz,
        sz: Number(twap.sz),
        minutes: twap.minutes,
        reduceOnly: twap.reduceOnly,
        randomize: twap.randomize,
      };
    });
  }, [mapSpotNameToTokenDetails, twaps]);

  const sortedData = useMemo(
    () => data.sort((a, b) => b.timestamp - a.timestamp),
    [data],
  );

  return (
    <div className="w-full">
      <Visibility visible={isMobile && !!data.length}>
        <div className="w-full flex justify-end py-2 px-4">
          <TerminateTwapButton
            variant="ghost"
            activeTwaps={data}
            label="Terminate All"
            className={cn("w-fit text-sell text-xs font-medium h-fit p-0", {
              "text-neutral-gray-400": !data.length,
            })}
          />
        </div>
      </Visibility>
      <AdaptiveDataTable
        columns={columns}
        data={sortedData}
        loading={isLoading}
        initialState={{
          pagination: {
            pageIndex: 0,
            pageSize: 30,
          },
        }}
        meta={{
          activeTwaps: data,
        }}
        className="space-y-1 md:space-y-1.5 mb-3"
        wrapperClassName="px-2 md:p-0"
        thClassName="h-8 py-0 font-medium text-xs"
        rowClassName="text-xs font-medium whitespace-nowrap py-0"
        rowCellClassName="py-1"
        render={(entry: ActiveTwap) => <ActiveTwapCard data={entry} />}
        noData="No active TWAPs yet"
        disablePagination
      />
    </div>
  );
};

const ActiveTwapCard = ({ data }: { data: ActiveTwap }) => {
  const isSell = data.side === "A";

  return (
    <div className="w-full p-3 bg-neutral-gray-600 rounded-lg">
      <div className="flex items-center justify-between gap-x-4 mb-1">
        <div className="flex items-center gap-x-1">
          <div className="flex items-center gap-x-1 mr-1">
            <Visibility visible={data.type !== "outcome"}>
              <TokenImage
                key={data.base + data.coin}
                name={data.base}
                coin={data.coin}
                className="size-4"
                instrumentType={data.type === "spot" ? "spot" : "perps"}
              />
            </Visibility>
            <Link
              href={data.href}
              className="text-sm text-neutral-gray-100 font-medium line-clamp-1 hover:text-primary"
            >
              {data.symbol}
            </Link>
          </div>
          {data.dex && <Tag value={data.dex} />}
          <Tag
            value={isSell ? "Sell" : "Buy"}
            className={cn("text-buy bg-buy/10", {
              "text-sell bg-sell/10": isSell,
            })}
          />
        </div>

        <p className="text-xs text-neutral-gray-400">
          {formatTwapRuntime({
            totalMinutes: data.minutes,
            startTimestamp: data.timestamp,
            includeElapsed: true,
            excludeTotal: true,
          })}
        </p>
      </div>

      <div className="w-full grid grid-cols-4 gap-2 text-sm">
        <CardItem
          label="Size"
          value={formatNumber(Number(data.sz), { symbol: data.base })}
        />
        <CardItem
          label="Executed Size"
          value={formatNumber(data.executedSz, { symbol: data.base })}
        />
        <CardItem
          label="Average Price"
          value={formatNumber(data.averagePx, { useFallback: true })}
        />
        <CardItem
          label="Total Time"
          value={formatTwapRuntime({
            totalMinutes: data.minutes,
            startTimestamp: data.timestamp,
            includeElapsed: false,
          })}
        />
      </div>

      <TerminateTwapButton
        showLoading
        activeTwaps={[data]}
        variant="secondary"
        size="sm"
        className="h-7 mt-2 text-xs text-white"
        label="Terminate"
      />
    </div>
  );
};

type TerminateTwapButtonProps = React.ComponentProps<typeof Button> & {
  activeTwaps: ActiveTwap[];
  showLoading?: boolean;
};

const TerminateTwapButton = ({
  activeTwaps,
  showLoading,
  ...props
}: TerminateTwapButtonProps) => {
  const { processing, terminateTwap } = useTerminateTwap();

  return (
    <Button
      {...props}
      loading={showLoading && processing}
      disabled={processing}
      onClick={() => terminateTwap(activeTwaps)}
    />
  );
};

export default ActiveTWAPs;
