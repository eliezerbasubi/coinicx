import React from "react";
import {
  ActiveAssetCtxWsEvent,
  ActiveSpotAssetCtxWsEvent,
} from "@nktkas/hyperliquid";
import { zeroAddress } from "viem";
import { useAccount } from "wagmi";

import { hlSubClient } from "@/lib/services/transport";
import { useTradeContext } from "@/lib/store/trade/hooks";
import { useInstrumentStore } from "@/lib/store/trade/instrument";
import {
  useOrderBookStore,
  useShallowOrderBookStore,
} from "@/lib/store/trade/orderbook";
import { useUserTradeStore } from "@/lib/store/trade/user-trade";
import { useSubscription } from "@/hooks/useSubscription";

import {
  getMaxSizeDecimals,
  getNSigFigsAndMantissa,
  getPriceDecimals,
} from "../utils";

type Props = {
  children: React.ReactNode;
};

/**
 * This provider is responsible for subscribing to real-time data from the
 * HighLevel service for the currently selected trading pair.
 */
const TradingPairSubsProvider = ({ children }: Props) => {
  const { address } = useAccount();

  const { coin, instrumentType, decimals, setDecimals } = useTradeContext(
    (s) => ({
      coin: s.coin,
      instrumentType: s.instrumentType,
      decimals: s.decimals,
      setDecimals: s.setDecimals,
    }),
  );

  const tickSize = useShallowOrderBookStore((s) => s.tickSize);

  const user = address || zeroAddress;

  // Subscribe to user's active asset data for perps only
  useSubscription(() => {
    if (instrumentType !== "perps" || !coin) return;
    return hlSubClient.activeAssetData({ user, coin }, (data) => {
      useUserTradeStore.getState().applyActiveAssetData(data);
    });
  }, [user, coin, instrumentType]);

  // Subscribe to order book l2Book state
  useSubscription(() => {
    if (!coin) return;

    const { nSigFigs, mantissa } = getNSigFigsAndMantissa(tickSize);

    return hlSubClient.l2Book({ coin, nSigFigs, mantissa }, (data) => {
      useOrderBookStore
        .getState()
        .setSnapshot({ bids: data.levels[0], asks: data.levels[1] });
    });
  }, [coin, tickSize]);

  const applyTokenCtxAndTicks = (
    data: ActiveSpotAssetCtxWsEvent["ctx"] | ActiveAssetCtxWsEvent["ctx"],
  ) => {
    const isSpot = instrumentType === "spot";
    const { assetMeta, setAssetCtx } = useInstrumentStore.getState();

    const price = Number(data.midPx ?? data.markPx);
    const maxSzDecimals = getMaxSizeDecimals(isSpot);
    const szDecimals = Number(assetMeta?.szDecimals ?? maxSzDecimals);

    // Update asset context
    setAssetCtx(data);

    const { ticks, setTicks } = useOrderBookStore.getState();
    if (ticks.length === 0) {
      setTicks(price, szDecimals, isSpot);
    }

    if (decimals === null) {
      const priceDecimals = getPriceDecimals(price, szDecimals, isSpot);
      setDecimals(priceDecimals);
    }
  };

  // Subscribe to active asset context state
  useSubscription(() => {
    if (!coin) return;

    if (instrumentType === "spot") {
      return hlSubClient.activeSpotAssetCtx({ coin }, (data) => {
        applyTokenCtxAndTicks(data.ctx);
      });
    }

    return hlSubClient.activeAssetCtx({ coin }, (data) => {
      applyTokenCtxAndTicks(data.ctx);
    });
  }, [coin, instrumentType]);

  return children;
};

export default TradingPairSubsProvider;
