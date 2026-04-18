import React from "react";
import { zeroAddress } from "viem";
import { useAccount } from "wagmi";

import { hlSubClient } from "@/lib/services/transport";
import { useUserTradeStore } from "@/lib/store/trade/user-trade";
import { useSubscription } from "@/hooks/useSubscription";
import { PREDICTIONS_QUOTE_ASSET } from "@/features/predict/lib/constants/predictions";
import { useMarketEventContext } from "@/features/predict/lib/store/market-event/hooks";

type Props = {
  children: React.ReactNode;
};

const MarketEventSubscriptionsProvider = ({ children }: Props) => {
  const { address } = useAccount();

  const coin = useMarketEventContext((s) => {
    return (
      s.marketEventMeta.outcomes[s.activeOutcomeIndex]?.coin ??
      s.marketEventMeta.coin
    );
  });

  const user = address ?? zeroAddress;

  useSubscription(() => {
    return hlSubClient.spotState({ user }, (data) => {
      useUserTradeStore.getState().applyActiveSpotAssetData({
        data: data.spotState,
        base: coin,
        quote: PREDICTIONS_QUOTE_ASSET,
        isSpot: true,
      });
    });
  }, [coin, user]);

  return children;
};

export default MarketEventSubscriptionsProvider;
