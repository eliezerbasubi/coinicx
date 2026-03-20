import { useMemo } from "react";

import { hlSubClient } from "@/lib/services/transport";
import { useSubscriptions } from "@/hooks/useSubscription";

import { useShallowSwapStore } from "../store";
import { isQuoteAsset } from "../utils/swap";
import { useSwapSpotMetas } from "./useSwapTokens";

/**
 * Subscribes to l2Book events for the currently selected swap token pair.
 * For direct swaps (base↔quote), subscribes to one book.
 * For routed swaps (base→USDC→base), subscribes to two books.
 */
export const useSwapOrderBook = () => {
  const { sellToken, buyToken, applyBookUpdate } = useShallowSwapStore(
    (s) => ({
      sellToken: s.sellToken,
      buyToken: s.buyToken,
      applyBookUpdate: s.applyBookUpdate,
    }),
  );

  const { data: spotData } = useSwapSpotMetas();

  // Resolve the spot pair names (e.g., "BTC/USDC") for each token
  const pairInfo = useMemo(() => {
    if (!spotData || !sellToken || !buyToken) return null;

    const { spotMeta, tokenNamesToUniverseIndex } = spotData;
    const sellIsQuote = isQuoteAsset(sellToken.name);
    const buyIsQuote = isQuoteAsset(buyToken.name);

    const resolve = (baseName: string, quoteName: string) => {
      const quoteMap = tokenNamesToUniverseIndex.get(baseName);
      if (!quoteMap) return null;

      // Try exact quote match first, then fall back to USDC
      const idx = quoteMap.get(quoteName) ?? quoteMap.get("USDC");
      if (idx === undefined) return null;

      const universe = spotMeta.universe[idx];
      if (!universe) return null;

      return {
        coin: universe.name,
        assetId: 10000 + universe.index,
      };
    };

    if (sellIsQuote && !buyIsQuote) {
      // Direct: buying buyToken with sellToken (quote)
      const pair = resolve(buyToken.name, sellToken.name);
      return pair ? { sell: null, buy: pair } : null;
    }

    if (!sellIsQuote && buyIsQuote) {
      // Direct: selling sellToken for buyToken (quote)
      const pair = resolve(sellToken.name, buyToken.name);
      return pair ? { sell: pair, buy: null } : null;
    }

    if (!sellIsQuote && !buyIsQuote) {
      // Routed: sell → USDC → buy
      const sellPair = resolve(sellToken.name, "USDC");
      const buyPair = resolve(buyToken.name, "USDC");
      if (!sellPair || !buyPair) return null;
      return { sell: sellPair, buy: buyPair };
    }

    // Both are quotes — unusual but handle gracefully
    return null;
  }, [spotData, sellToken, buyToken]);

  const subscribes = useMemo(() => {
    if (!pairInfo) return [];

    const subs: Array<() => ReturnType<typeof hlSubClient.l2Book>> = [];

    if (pairInfo.sell) {
      const { coin, assetId } = pairInfo.sell;
      subs.push(() =>
        hlSubClient.l2Book({ coin, nSigFigs: null, mantissa: null }, (data) => {
          applyBookUpdate("sell", {
            bids: data.levels[0],
            asks: data.levels[1],
            assetId,
          });
        }),
      );
    }

    if (pairInfo.buy) {
      const { coin, assetId } = pairInfo.buy;
      subs.push(() =>
        hlSubClient.l2Book({ coin, nSigFigs: null, mantissa: null }, (data) => {
          applyBookUpdate("buy", {
            bids: data.levels[0],
            asks: data.levels[1],
            assetId,
          });
        }),
      );
    }

    return subs;
  }, [pairInfo, applyBookUpdate]);

  useSubscriptions(subscribes, [subscribes]);

  return { pairInfo };
};
