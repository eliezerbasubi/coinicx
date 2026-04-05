import { useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/lib/constants/queryKeys";
import { hlInfoClient } from "@/lib/services/transport";
import { useShallowInstrumentStore } from "@/lib/store/trade/instrument";
import { useShallowUserTradeStore } from "@/lib/store/trade/user-trade";
import { SwapSpotToken } from "@/lib/types/swap";
import { mapDataToSpotMetas } from "@/features/trade/utils";

import { DEFAULT_SELL_ASSET } from "../constants";
import { useSwapStore } from "../store";

export const useSwapSpotMetas = () => {
  const { data, status } = useQuery({
    queryKey: [QUERY_KEYS.spotMeta],
    staleTime: Infinity,
    queryFn: async () => {
      const spotMeta = await hlInfoClient.spotMeta();

      return mapDataToSpotMetas(spotMeta);
    },
  });

  return { data, status };
};

export const useSwapTokens = () => {
  const { data, status } = useSwapSpotMetas();

  const spotBalances = useShallowUserTradeStore((s) => s.spotBalances);
  const spotAssetCtxs = useShallowInstrumentStore((s) => s.spotAssetCtxs);

  const tokens = useMemo<SwapSpotToken[]>(() => {
    if (!data) return [];

    const { spotMeta, tokenIndicesToSpot } = data;
    const balanceByToken = new Map<number, string>();

    for (const balance of spotBalances) {
      const total = Number(balance.total) - Number(balance.hold);
      if (total > 0) {
        balanceByToken.set(balance.token, total.toString());
      }
    }

    const result: SwapSpotToken[] = [];
    let insertIdx = 0;

    for (const token of spotMeta.tokens) {
      const balance = balanceByToken.get(token.index) ?? "0";
      const hasBalance = balance !== "0";

      let balanceNtl: string | undefined;

      if (hasBalance && token.index !== 0) {
        const spot = tokenIndicesToSpot.get(token.index)?.get(0);
        if (spot !== undefined) {
          const markPx = Number(spotAssetCtxs[spot.spotName]?.markPx || "0");
          balanceNtl = (Number(balance) * markPx).toString();
        }
      } else if (hasBalance) {
        balanceNtl = balance;
      }

      const entry: SwapSpotToken = {
        name: token.name,
        szDecimals: token.szDecimals,
        fullName: token.fullName,
        index: token.index,
        balance,
        balanceNtl,
      };

      /* Rename layer one tokens starting with Unit */
      const unitKeyword = "Unit ";

      if (token.fullName && token.fullName.startsWith(unitKeyword)) {
        // Replace the first U character with empty string from name
        token.name = token.name.replace("U", "");
        token.fullName = token.fullName.replace(unitKeyword, "");
      }

      if (hasBalance) {
        result.splice(insertIdx++, 0, entry);
      } else {
        result.push(entry);
      }
    }

    return result;
  }, [spotBalances, data, spotAssetCtxs]);

  /** Ensures the default token is only set once */
  const hasAppliedDefault = useRef(false);

  // Assign balance to the default sell token
  useEffect(() => {
    if (!tokens.length || !spotBalances.length || hasAppliedDefault.current)
      return;

    const defaultToken = tokens[DEFAULT_SELL_ASSET.index];
    const sellToken = useSwapStore.getState().sellToken;

    if (sellToken && defaultToken.index === sellToken.index) {
      useSwapStore.setState({ sellToken: defaultToken });

      // Make sure balances are loaded
      if (spotBalances) {
        hasAppliedDefault.current = true;
      }
    }
  }, [spotBalances, tokens]);

  return {
    tokens,
    status,
  };
};
