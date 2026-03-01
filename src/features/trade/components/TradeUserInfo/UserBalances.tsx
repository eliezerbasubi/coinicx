import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { InfinityIcon } from "lucide-react";

import AdaptiveDataTable from "@/components/ui/adaptive-datatable";
import { Button } from "@/components/ui/button";
import { useMetaAndAssetCtxs } from "@/features/trade/hooks/useMetaAndAssetCtxs";
import { getTokenDisplayName } from "@/features/trade/utils/getTokenDisplayName";
import { useShallowInstrumentStore } from "@/store/trade/instrument";
import { useShallowUserTradeStore } from "@/store/trade/user-trade";
import { cn } from "@/utils/cn";
import { formatNumber } from "@/utils/formatting/numbers";

import TokenImage from "../TokenImage";

interface UserBalance {
  coin: string;
  isSpot: boolean;
  totalBalance: number;
  availableBalance: number;
  usdValue: number;
  unrealizedPnl: number;
  returnOnEquity: number;
}

const columns: ColumnDef<UserBalance>[] = [
  {
    header: "Coin",
    accessorFn: (row) => row.coin,
    cell({ row }) {
      return (
        <span className="font-medium space-x-1">
          <span>{row.original.coin}</span>
          {row.original.coin === "USDC" && (
            <span>{row.original.isSpot ? "(Spot)" : "(Perps)"}</span>
          )}
        </span>
      );
    },
  },
  {
    header: "Total Balance",
    id: "totalBalance",
    accessorFn: (row) => row.totalBalance,
    cell({ row: { original } }) {
      return (
        <div className="flex items-center gap-1">
          <p>{original.totalBalance}</p>
          <p>{original.coin}</p>
        </div>
      );
    },
  },
  {
    id: "availableBalance",
    header: "Available Balance",
    cell({ row: { original } }) {
      return <span>{original.availableBalance}</span>;
    },
  },
  {
    id: "usdValue",
    header: "Value (USD)",
    cell({ row: { original } }) {
      return (
        <span>
          {formatNumber(Number(original.usdValue), { style: "currency" })}
        </span>
      );
    },
  },
  {
    id: "unrealizedPnl",
    header: "PNL (ROE %)",
    cell({ row: { original } }) {
      const sign = original.unrealizedPnl > 0 && "+";

      if (original.unrealizedPnl === 0) {
        return null;
      }

      return (
        <span
          className={cn("space-x-1 text-buy", {
            "text-sell": original.unrealizedPnl < 0,
          })}
        >
          <span>
            {sign}
            {formatNumber(original.unrealizedPnl, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          <span>
            ({sign}
            {formatNumber(original.returnOnEquity, {
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
    id: "action",
    header: "Action",
    cell() {
      return (
        <button type="button" className="text-primary text-xs font-medium">
          Transfer
        </button>
      );
    },
  },
];

const UserBalances = () => {
  const { tokensToSpotId } = useMetaAndAssetCtxs();
  const spotAssetCtxs = useShallowInstrumentStore((s) => s.spotAssetCtxs);
  const { spotBalances, allDexsClearinghouseState } = useShallowUserTradeStore(
    (s) => ({
      spotBalances: s.spotBalances,
      allDexsClearinghouseState: s.allDexsClearinghouseState,
    }),
  );

  const perpsBalance = useMemo(() => {
    const data = allDexsClearinghouseState?.assetPositions.reduce(
      (acc, dexAssetPosition) => {
        return {
          unrealizedPnl:
            acc.unrealizedPnl + Number(dexAssetPosition.position.unrealizedPnl),
          returnOnEquity:
            acc.returnOnEquity +
            Number(dexAssetPosition.position.returnOnEquity),
        };
      },
      { unrealizedPnl: 0, returnOnEquity: 0 },
    );

    return {
      coin: "USDC",
      isSpot: false,
      totalBalance: Number(
        allDexsClearinghouseState?.marginSummary.accountValue || "0",
      ),
      availableBalance: Number(allDexsClearinghouseState?.withdrawable || "0"),
      usdValue: Number(
        allDexsClearinghouseState?.marginSummary.accountValue || "0",
      ),
      unrealizedPnl: data?.unrealizedPnl || 0,
      returnOnEquity: data?.returnOnEquity || 0,
    };
  }, [allDexsClearinghouseState]);

  const balances = useMemo(
    () =>
      spotBalances
        .filter((balance) => Number(balance.total) > 0)
        .map((balance) => {
          const coin = getTokenDisplayName(balance.coin);

          if (balance.token === 0) {
            return {
              totalBalance: Number(balance.total),
              availableBalance: Number(balance.total) - Number(balance.hold),
              coin,
              usdValue: Number(balance.total),
              isSpot: true,
              unrealizedPnl: 0,
              returnOnEquity: 0,
            };
          }

          // Prefer USDC-quoted pairs (token 0) for accurate USD conversion.
          const spotId = tokensToSpotId?.get(balance.token)?.get(0);

          if (spotId === undefined)
            return {
              totalBalance: Number(balance.total),
              availableBalance: Number(balance.total) - Number(balance.hold),
              coin,
              usdValue: 0,
              isSpot: true,
              unrealizedPnl: 0,
              returnOnEquity: 0,
            };

          const ctx = spotAssetCtxs[spotId];

          const markPx = Number(ctx.markPx || "1");
          const entryNtl = Number(balance.entryNtl);
          const totalBalance = Number(balance.total);
          const totalBalanceNtl = totalBalance * markPx;

          const unrealizedPnl = totalBalanceNtl - entryNtl;
          const returnOnEquity = entryNtl === 0 ? 0 : unrealizedPnl / entryNtl;

          const availableBalance = totalBalance - Number(balance.hold);
          const usdValue = availableBalance * markPx;

          return {
            totalBalance,
            availableBalance,
            coin,
            isSpot: true,
            usdValue,
            unrealizedPnl,
            returnOnEquity,
          };
        }),
    [spotBalances, tokensToSpotId, spotAssetCtxs],
  );

  const data = useMemo(() => {
    return [perpsBalance, ...balances];
  }, [balances, perpsBalance]);

  return (
    <AdaptiveDataTable
      columns={columns}
      data={data}
      loading={false}
      className="space-y-1.5"
      wrapperClassName="mb-6 mt-3 md:mt-0 space-y-3"
      tableClassName="table-auto overflow-auto md:table-fixed"
      thClassName="h-8 py-0 font-medium text-xs"
      rowClassName="text-xs font-medium whitespace-nowrap py-0"
      rowCellClassName="py-1"
      render={(entry) => <UserBalanceCard data={entry} />}
      hidePagination
    />
  );
};

type UserBalanceCardProps = {
  data: UserBalance;
};

const UserBalanceCard = ({ data }: UserBalanceCardProps) => {
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

          {!data.isSpot && (
            <div className="absolute -bottom-1 -right-1 size-4.5 border-2 border-background rounded-md bg-neutral-gray-400 grid place-content-center">
              <InfinityIcon className="size-3" />
            </div>
          )}
        </div>
        <div className="flex-1 text-sm">
          <p className="text-white font-medium flex items-center">
            {data.coin}
            {!data.isSpot && (
              <span className="inline-block px-2 text-[8px]/[18px] h-[18px] rounded-2xl ml-1 text-neutral-gray-400 bg-neutral-gray-600 font-medium uppercase">
                Perps
              </span>
            )}
          </p>
          <p className="text-xs text-neutral-gray-400 font-medium mt-1">
            <span>
              {formatNumber(Number(data.totalBalance), {
                minimumFractionDigits: 2,
                roundingMode: "trunc",
              })}
              <span className="ml-1">
                <span className="mr-1">≈</span>
                {formatNumber(data.usdValue, {
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

export default UserBalances;
