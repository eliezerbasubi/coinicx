import React from "react";
import { zeroAddress } from "viem";
import { useAccount } from "wagmi";

import { useSubscription } from "@/hooks/useSubscription";
import { hlSubClient } from "@/services/transport";
import { useTradeContext } from "@/store/trade/hooks";
import { useUserTradeStore } from "@/store/trade/user-trade";

type Props = {
  children: React.ReactNode;
};

/**
 * This provider is responsible for subscribing to real-time data from the
 * HighLevel service for the currently selected trading pair.
 */
const TradingPairSubsProvider = ({ children }: Props) => {
  const { address } = useAccount();

  const { coin, instrumentType } = useTradeContext((s) => ({
    coin: s.coin,
    instrumentType: s.instrumentType,
  }));

  const user = address || zeroAddress;

  // Subscribe to user's active asset data for perps only
  useSubscription(() => {
    if (instrumentType !== "perps" || !coin) return;
    return hlSubClient.activeAssetData({ user, coin }, (data) => {
      useUserTradeStore.getState().applyActiveAssetData(data);
    });
  }, [user, coin, instrumentType]);

  // Subscribe to web data for perps only
  useSubscription(() => {
    if (!address || instrumentType !== "perps") return;

    return hlSubClient.webData3({ user: address }, (data) => {
      useUserTradeStore.getState().applyWebData(data);
    });
  }, [address, instrumentType]);

  return children;
};

export default TradingPairSubsProvider;
