"use client";

import React, { useMemo } from "react";
import { useAccount, useAccountEffect } from "wagmi";

import { hlSubClient } from "@/lib/services/transport";
import { useUserTradeStore } from "@/lib/store/trade/user-trade";
import { useSubscriptions } from "@/hooks/useSubscription";

type Props = {
  children: React.ReactNode;
};

const UserTradeProvider = ({ children }: Props) => {
  const { address } = useAccount();

  const subscribes = useMemo(() => {
    if (!address) return [];

    const state = useUserTradeStore.getState();

    return [
      // Subscribe to web data3 state
      () =>
        hlSubClient.webData3({ user: address }, (data) => {
          state.applyUserEventStates({ webData: data });
        }),

      // Subscribe to spot state
      () =>
        hlSubClient.spotState({ user: address }, (data) => {
          state.applySpotState(data);
        }),

      // Subscribe to all dexs clearinghouse state
      () =>
        hlSubClient.allDexsClearinghouseState({ user: address }, (data) => {
          state.applyClearinghouseState(data);
        }),

      // Subscribe to all dexs open orders state
      () =>
        hlSubClient.openOrders({ user: address, dex: "ALL_DEXS" }, (data) => {
          state.applyUserEventStates({ openOrders: data.orders });
        }),

      // Subscribe to user fills state
      () =>
        hlSubClient.userFills({ user: address }, (data) => {
          state.applyUserEventStates({ fills: data.fills });
        }),

      // Subscribe to user active twap state
      () =>
        hlSubClient.twapStates({ user: address }, (data) => {
          state.applyUserEventStates({ twaps: data.states });
        }),

      // Subscribe to user twap fills history state
      () =>
        hlSubClient.userTwapHistory({ user: address }, (data) => {
          state.applyUserEventStates({ history: data.history });
        }),

      // Subscribe to user twap slice fills state
      () =>
        hlSubClient.userTwapSliceFills({ user: address }, (data) => {
          state.applyUserEventStates({ sliceFills: data.twapSliceFills });
        }),

      // Subscribe to user historical orders state
      () =>
        hlSubClient.userHistoricalOrders({ user: address }, (data) => {
          state.applyUserEventStates({ historicalOrders: data.orderHistory });
        }),

      // Subscribe to user fundings state
      () =>
        hlSubClient.userFundings({ user: address }, (data) => {
          state.applyUserEventStates({ fundings: data.fundings });
        }),

      // Subscribe to user non funding ledger state
      () =>
        hlSubClient.userNonFundingLedgerUpdates({ user: address }, (data) => {
          state.applyUserEventStates({
            nonFundingLedger: data.nonFundingLedgerUpdates,
          });
        }),
    ];
  }, [address]);

  // Subscribe to all user events
  useSubscriptions(subscribes, [subscribes]);

  // Reset user state when disconnected
  useAccountEffect({
    onDisconnect() {
      useUserTradeStore.getState().reset();
    },
  });

  return children;
};

export default UserTradeProvider;
