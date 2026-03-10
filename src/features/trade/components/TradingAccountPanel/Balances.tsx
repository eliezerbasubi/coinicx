import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { InfinityIcon } from "lucide-react";

import AdaptiveDataTable from "@/components/ui/adaptive-datatable";
import { Button } from "@/components/ui/button";
import Tag from "@/components/ui/tag";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMetaAndAssetCtxs } from "@/features/trade/hooks/useMetaAndAssetCtxs";
import { getTokenDisplayName } from "@/features/trade/utils/getTokenDisplayName";
import { useAccountTransactStore } from "@/store/trade/account-transact";
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
  withdrawable: number;
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
        <span className="space-x-1">
          <span>
            {formatNumber(original.totalBalance, {
              minimumFractionDigits: 2,
              maximumFractionDigits: original.isSpot ? 5 : 2,
            })}
          </span>
          <span>{original.coin}</span>
        </span>
      );
    },
  },
  {
    id: "availableBalance",
    header: "Available Balance",
    cell({ row: { original } }) {
      if (original.isSpot) {
        return (
          <span className="space-x-1">
            <span>
              {formatNumber(original.availableBalance, {
                minimumFractionDigits: 2,
                maximumFractionDigits: original.isSpot ? 5 : 2,
              })}
            </span>
            <span>{original.coin}</span>
          </span>
        );
      }
      return (
        <Tooltip>
          <TooltipTrigger
            asChild
            className="underline decoration-dashed cursor-help"
          >
            <span className="space-x-1">
              <span>
                {formatNumber(original.availableBalance, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: original.isSpot ? 5 : 2,
                })}
              </span>
              <span>{original.coin}</span>
            </span>
          </TooltipTrigger>
          <TooltipContent className="text-neutral-gray-500 max-w-sm">
            <p>
              Available balance to open positions ignoring open orders.{" "}
              {formatNumber(original.withdrawable, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              {original.coin} is available to withdraw, transfer, or open HIP-3
              positions.
            </p>
          </TooltipContent>
        </Tooltip>
      );
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
            {formatNumber(original.unrealizedPnl, {
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
    id: "action",
    header: "Action",
    cell({ row: { original } }) {
      if (original.coin !== "USDC") return null;
      return (
        <button
          type="button"
          className="text-primary text-xs font-medium"
          onClick={() =>
            useAccountTransactStore.getState().openAccountTransact("transfer")
          }
        >
          Transfer
        </button>
      );
    },
  },
];

const Balances = () => {
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

    const withdrawable = Number(allDexsClearinghouseState?.withdrawable || "0");
    const totalMarginUsed = Number(
      allDexsClearinghouseState?.marginSummary.totalMarginUsed || "0",
    );
    const totalBalance = Number(
      allDexsClearinghouseState?.marginSummary.accountValue || "0",
    );

    return {
      coin: "USDC",
      isSpot: false,
      totalBalance: totalBalance,
      availableBalance: totalBalance - totalMarginUsed,
      withdrawable,
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
              withdrawable: 0,
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
              withdrawable: 0,
            };

          const ctx = spotAssetCtxs[spotId];

          const markPx = Number(ctx?.markPx || "1");
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
            withdrawable: availableBalance,
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
      className="space-y-1.5 mb-3"
      thClassName="h-8 py-0 font-medium text-xs"
      rowClassName="text-xs font-medium whitespace-nowrap py-0"
      rowCellClassName="py-1"
      render={(entry) => <BalanceCard data={entry} />}
      noData="No balances yet"
      disablePagination
    />
  );
};

type BalanceCardProps = {
  data: UserBalance;
};

const BalanceCard = ({ data }: BalanceCardProps) => {
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
              <span className="inline-block px-2 text-[8px]/[18px] h-4.5 rounded-2xl ml-1 text-neutral-gray-400 bg-neutral-gray-600 font-medium uppercase">
                Perps
              </span>
            )}
          </p>
          <div className="flex gap-x-1 text-xs text-neutral-gray-400 font-medium mt-1">
            <p>
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
            </p>
            <Tag
              value={formatNumber(data.returnOnEquity, {
                style: "percent",
                useSign: true,
                minimumFractionDigits: 2,
              })}
              className={cn("text-buy bg-buy/10", {
                "text-sell bg-sell/10": data.returnOnEquity < 0,
              })}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 text-right">
        <Button
          variant="secondary"
          size="sm"
          className="h-6 w-fit font-medium text-xs md:text-[13px] rounded-md px-3"
          label="Transfer"
          onClick={() =>
            useAccountTransactStore.getState().openAccountTransact("transfer")
          }
        />
      </div>
    </div>
  );
};

export default Balances;
