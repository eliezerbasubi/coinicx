import { useMemo } from "react";

import { useShallowInstrumentStore } from "@/lib/store/trade/instrument";
import { useShallowUserTradeStore } from "@/lib/store/trade/user-trade";
import {
  convertCoinToSpotName,
  isOutcomeCoin,
} from "@/features/predict/lib/utils/outcomes";

import { getTokenDisplayName } from "../utils/getTokenDisplayName";
import { useAssetMetas } from "./useAssetMetas";

export const useAccountBalances = () => {
  const { tokenIndicesToSpot } = useAssetMetas();
  const spotAssetCtxs = useShallowInstrumentStore((s) => s.spotAssetCtxs);
  const { spotBalances: accountSpotBalances, allDexsClearinghouseState } =
    useShallowUserTradeStore((s) => ({
      spotBalances: s.spotBalances,
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

  const spotAccount = useMemo(() => {
    let totalUnrealizedPnl = 0;
    let totalReturnOnEquity = 0;
    let spotEquity = 0;
    let totalShares = 0;
    let totalSharesUsdValue = 0;
    const balances = [];

    for (const balance of accountSpotBalances) {
      // Skip if balance is zero
      if (Number(balance.total) <= 0) continue;

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
        const totalBalance = Number(balance.total);

        spotEquity += totalBalance * markPx;
        totalShares += totalBalance;
        totalSharesUsdValue += totalBalance * markPx;

        continue;
      }

      // Prefer USDC-quoted pairs (token 0) for accurate USD conversion.
      const spot = tokenIndicesToSpot?.get(balance.token)?.get(0);

      if (spot === undefined) {
        continue;
      }

      const ctx = spotAssetCtxs[spot.spotName];

      const markPx = Number(ctx?.markPx || "1");
      const entryNtl = Number(balance.entryNtl);
      const totalBalance = Number(balance.total);
      const totalBalanceNtl = totalBalance * markPx;

      const unrealizedPnl = totalBalanceNtl - entryNtl;
      const returnOnEquity = entryNtl === 0 ? 0 : unrealizedPnl / entryNtl;

      const availableBalance = totalBalance - Number(balance.hold);
      const usdValue = availableBalance * markPx;

      // Sum equity, unrealized pnl and return on equity
      totalUnrealizedPnl += unrealizedPnl;
      totalReturnOnEquity += returnOnEquity;
      spotEquity += totalBalanceNtl;

      balances.push({
        totalBalance,
        availableBalance,
        coin,
        isSpot: true,
        usdValue,
        unrealizedPnl,
        returnOnEquity,
        withdrawable: availableBalance,
      });
    }

    return { balances, spotEquity, totalReturnOnEquity, totalUnrealizedPnl };
  }, [accountSpotBalances, tokenIndicesToSpot, spotAssetCtxs]);

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
