"use client";

import React from "react";
import { zeroAddress } from "viem";
import { useAccount } from "wagmi";

import { useSubscription } from "@/hooks/useSubscription";
import { hlSubClient } from "@/services/transport";
import { useTradeContext } from "@/store/trade/hooks";
import { useUserTradeStore } from "@/store/trade/user-trade";

import { useUserFees } from "../hooks/useUserFees";

type Props = {
  children: React.ReactNode;
};

const UserTradeProvider = ({ children }: Props) => {
  const { address } = useAccount();
  const coin = useTradeContext((s) => s.coin);
  const instrumentType = useTradeContext((s) => s.instrumentType);

  const user = address || zeroAddress;

  useUserFees({ notifyOnChangeProps: [] });

  // Subscribe to user's active asset data for perps only
  useSubscription(() => {
    if (instrumentType !== "perps" || !coin) return;
    return hlSubClient.activeAssetData({ user, coin }, (data) => {
      useUserTradeStore.getState().applyActiveAssetData(data);
    });
  }, [user, coin, instrumentType]);

  // Subscribe to user's spot state for spot only
  // Subscribe only when user is connected to avoid showing wrong data
  useSubscription(() => {
    if (!address || instrumentType !== "spot") return;

    return hlSubClient.spotState({ user: address }, (data) => {
      useUserTradeStore.getState().applySpotState(data);
    });
  }, [address, instrumentType]);

  useSubscription(() => {
    if (!address || instrumentType !== "perps") return;

    return hlSubClient.webData3({ user: address }, (data) => {
      useUserTradeStore.getState().applyWebData(data);
    });
  }, [address, instrumentType]);

  useSubscription(() => {
    if (!address || instrumentType !== "perps") return;

    return hlSubClient.allDexsClearinghouseState({ user: address }, (data) => {
      useUserTradeStore.getState().applyClearinghouseState(data);
    });
  }, [address, instrumentType]);

  return children;
};

export default UserTradeProvider;
