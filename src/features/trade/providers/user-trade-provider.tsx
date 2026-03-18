"use client";

import React from "react";
import { useAccount } from "wagmi";

import { hlSubClient } from "@/lib/services/transport";
import { useUserTradeStore } from "@/lib/store/trade/user-trade";
import { useSubscription } from "@/hooks/useSubscription";

type Props = {
  children: React.ReactNode;
};

const UserTradeProvider = ({ children }: Props) => {
  const { address } = useAccount();

  // Subscribe to web data3 state
  useSubscription(() => {
    if (!address) return;

    return hlSubClient.webData3({ user: address }, (data) => {
      useUserTradeStore.getState().applyWebData(data);
    });
  }, [address]);

  // Subscribe to spot state
  useSubscription(() => {
    if (!address) return;

    return hlSubClient.spotState({ user: address }, (data) => {
      useUserTradeStore.getState().applySpotState(data);
    });
  }, [address]);

  // Subscribe to all dexs clearinghouse state
  useSubscription(() => {
    if (!address) return;

    return hlSubClient.allDexsClearinghouseState({ user: address }, (data) => {
      useUserTradeStore.getState().applyClearinghouseState(data);
    });
  }, [address]);

  // Subscribe to all dexs open orders state
  useSubscription(() => {
    if (!address) return;
    return hlSubClient.openOrders(
      { user: address, dex: "ALL_DEXS" },
      (data) => {
        useUserTradeStore.getState().applyOpenOrders(data);
      },
    );
  }, [address]);

  // Subscribe to user fills state
  useSubscription(() => {
    if (!address) return;
    return hlSubClient.userFills({ user: address }, (data) => {
      useUserTradeStore.getState().applyUserFills(data);
    });
  }, [address]);

  // Subscribe to user twap state
  useSubscription(() => {
    if (!address) return;
    return hlSubClient.twapStates({ user: address }, (data) => {
      useUserTradeStore.getState().applyTwapStates({ twaps: data.states });
    });
  }, [address]);

  // Subscribe to user twap history state
  useSubscription(() => {
    if (!address) return;
    return hlSubClient.userTwapHistory({ user: address }, (data) => {
      useUserTradeStore.getState().applyTwapStates({ history: data.history });
    });
  }, [address]);

  // Subscribe to user twap fills history state
  useSubscription(() => {
    if (!address) return;
    return hlSubClient.userTwapSliceFills({ user: address }, (data) => {
      useUserTradeStore
        .getState()
        .applyTwapStates({ sliceFills: data.twapSliceFills });
    });
  }, [address]);

  // Subscribe to user historical orders state
  useSubscription(() => {
    if (!address) return;
    return hlSubClient.userHistoricalOrders({ user: address }, (data) => {
      useUserTradeStore.getState().applyUserHistoricalOrders(data);
    });
  }, [address]);

  // Subscribe to user fundings state
  useSubscription(() => {
    if (!address) return;
    return hlSubClient.userFundings({ user: address }, (data) => {
      useUserTradeStore.getState().applyUserFundings(data);
    });
  }, [address]);

  // Subscribe to user fundings state
  useSubscription(() => {
    if (!address) return;
    return hlSubClient.userNonFundingLedgerUpdates(
      { user: address },
      (data) => {
        useUserTradeStore.getState().applyUserNonFundingLedgerUpdates(data);
      },
    );
  }, [address]);

  return children;
};

export default UserTradeProvider;
