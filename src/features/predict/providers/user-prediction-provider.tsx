import React, { useMemo } from "react";
import { useAccount } from "wagmi";

import { hlSubClient } from "@/lib/services/transport";
import { useSubscriptions } from "@/hooks/useSubscription";

import { useUserPredictionStore } from "../lib/store/user-prediction";

type Props = {
  children: React.ReactNode;
};

const UserPredictionProvider = ({ children }: Props) => {
  const { address } = useAccount();

  const subscribes = useMemo(() => {
    if (!address) return [];

    const state = useUserPredictionStore.getState();

    return [
      // Subscribe to spot state
      () =>
        hlSubClient.spotState({ user: address }, (data) => {
          state.applyPredictionBalances(data);
        }),

      // Subscribe to all dexs open orders state
      () =>
        hlSubClient.openOrders({ user: address, dex: "ALL_DEXS" }, (data) => {
          state.applyOpenOrders(data);
        }),
    ];
  }, [address]);

  // Subscribe to all user events
  useSubscriptions(subscribes, [subscribes]);

  return children;
};

export default UserPredictionProvider;
