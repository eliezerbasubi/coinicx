import { useMemo } from "react";

import {
  SpotAssetCtx,
  useShallowInstrumentStore,
} from "@/lib/store/trade/instrument";
import { useShallowUserTradeStore } from "@/lib/store/trade/user-trade";
import { SpotBalance } from "@/lib/types/trade";
import {
  convertCoinToSpotName,
  isOutcomeCoin,
} from "@/features/predict/lib/utils/outcomes";

import { getTokenDisplayName } from "../utils/getTokenDisplayName";
import { useAssetMetas } from "./useAssetMetas";

export const useAccountBalances = () => {
  const { allDexsClearinghouseState } = useShallowUserTradeStore((s) => ({
    allDexsClearinghouseState: s.allDexsClearinghouseState,
  }));

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
      usdValue: totalBalance,
      unrealizedPnl: data?.unrealizedPnl || 0,
      returnOnEquity: data?.returnOnEquity || 0,
    };
  }, [allDexsClearinghouseState]);

  const spotAccount = useAccountSpotBalances();

  return {
    balances: [perpsBalance, ...spotAccount.balances],
    perpsEquity: perpsBalance.totalBalance,
    perpsUnrealizedPnl: perpsBalance.unrealizedPnl,
    perpsReturnOnEquity: perpsBalance.returnOnEquity,
    spotEquity: spotAccount.spotEquity,
    spotUnrealizedPnl: spotAccount.totalUnrealizedPnl,
    spotReturnOnEquity: spotAccount.totalReturnOnEquity,
  };
};

interface UseAccountSpotBalancesParams {
  /**
   * The variant of the account balances to return.
   * "balances" - returns only balances
   * "predictions" - returns only prediction balances
   */
  variant?: "balances" | "predictions";
}

export const useAccountSpotBalances = (
  params?: UseAccountSpotBalancesParams,
) => {
  const variant = params?.variant || "balances";

  const { tokenIndicesToSpot } = useAssetMetas();
  const spotAssetCtxs = useShallowInstrumentStore((s) => s.spotAssetCtxs);
  const accountSpotBalances = useShallowUserTradeStore((s) => s.spotBalances);

  const spotAccount = useMemo(() => {
    let totalUnrealizedPnl = 0;
    let totalReturnOnEquity = 0;
    let spotEquity = 0;
    let totalShares = 0;
    let totalSharesUsdValue = 0;
    const balances = [];
    const predictions = [];

    for (const balance of accountSpotBalances) {
      // Skip if balance is zero
      if (Number(balance.total) <= 0) continue;

      if (variant === "predictions" && !isOutcomeCoin(balance.coin)) {
        continue;
      }

      const coin = getTokenDisplayName(balance.coin);

      if (balance.token === 0) {
        spotEquity += Number(balance.total);

        balances.push({
          totalBalance: Number(balance.total),
          availableBalance: Number(balance.total) - Number(balance.hold),
          coin,
          usdValue: Number(balance.total),
          isSpot: true,
          unrealizedPnl: 0,
          returnOnEquity: 0,
          withdrawable: 0,
        });

        continue;
      }

      // Check if balance is an outcome coin
      // Add to spot equity, total shares and total shares usd value
      // Skip adding to balances array
      if (isOutcomeCoin(balance.coin)) {
        const spotName = convertCoinToSpotName(balance.coin);

        if (!spotName) continue;

        const ctx = spotAssetCtxs[spotName];

        if (!ctx) continue;

        const markPx = Number(ctx?.markPx || "1");
        const shares = Number(balance.total);

        spotEquity += shares * markPx;
        totalShares += shares;
        totalSharesUsdValue += shares * markPx;

        const positionValue = Number(balance.total) * markPx;

        const hasEntryPx = Number(balance.entryNtl) > 0;
        const pnl = hasEntryPx ? positionValue - Number(balance.entryNtl) : 0;
        const roe = hasEntryPx ? pnl / Number(balance.entryNtl) : 0;
        const entryPx = hasEntryPx ? Number(balance.entryNtl) / shares : 0;

        predictions.push({
          shares,
          coin,
          positionValue,
          isSpot: true,
          unrealizedPnl: pnl,
          returnOnEquity: roe,
          entryPx,
          markPx,
          midPx: ctx.midPx ?? "0",
        });

        continue;
      }

      // Prefer USDC-quoted pairs (token 0) for accurate USD conversion.
      const spot = tokenIndicesToSpot?.get(balance.token)?.get(0);

      if (spot === undefined) {
        continue;
      }

      const spotBalance = mapDataToSpotBalance({
        balance,
        spotAssetCtxs,
        spotName: spot.spotName,
      });

      // Sum equity, unrealized pnl and return on equity
      totalUnrealizedPnl += spotBalance.unrealizedPnl;
      totalReturnOnEquity += spotBalance.returnOnEquity;
      spotEquity += spotBalance.usdValue;

      balances.push({
        coin,
        ...spotBalance,
      });
    }

    return {
      balances,
      predictions,
      spotEquity,
      totalReturnOnEquity,
      totalUnrealizedPnl,
      totalShares,
      totalSharesUsdValue,
    };
  }, [accountSpotBalances, tokenIndicesToSpot, spotAssetCtxs]);

  return spotAccount;
};

const mapDataToSpotBalance = (params: {
  balance: SpotBalance;
  spotAssetCtxs: SpotAssetCtx;
  spotName: string;
}) => {
  const { balance, spotAssetCtxs, spotName } = params;
  const ctx = spotAssetCtxs[spotName];

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
    usdValue,
    isSpot: true,
    unrealizedPnl,
    returnOnEquity,
    withdrawable: availableBalance,
  };
};
