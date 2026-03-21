import { useMemo } from "react";

import { useShallowInstrumentStore } from "@/lib/store/trade/instrument";
import { useShallowUserTradeStore } from "@/lib/store/trade/user-trade";

import { getTokenDisplayName } from "../utils/getTokenDisplayName";
import { useMetaAndAssetCtxs } from "./useMetaAndAssetCtxs";

export const useAccountBalances = () => {
  const { tokensToSpotId } = useMetaAndAssetCtxs();
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

    const balances = accountSpotBalances
      .filter((balance) => Number(balance.total) > 0)
      .map((balance) => {
        const coin = getTokenDisplayName(balance.coin);

        if (balance.token === 0) {
          spotEquity += Number(balance.total);

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

        if (spotId === undefined) {
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
        }

        const ctx = spotAssetCtxs[spotId];

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
        spotEquity += totalBalance * markPx;

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
      });

    return { balances, spotEquity, totalReturnOnEquity, totalUnrealizedPnl };
  }, [accountSpotBalances, tokensToSpotId, spotAssetCtxs]);

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
