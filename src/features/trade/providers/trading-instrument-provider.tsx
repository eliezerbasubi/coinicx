"use client";

import React from "react";

import { hlSubClient } from "@/lib/services/transport";
import { useInstrumentStore } from "@/lib/store/trade/instrument";
import { useSubscription } from "@/hooks/useSubscription";

type Props = {
  children: React.ReactNode;
};

const TradingInstrumentProvider = ({ children }: Props) => {
  useSubscription(() => {
    return hlSubClient.spotAssetCtxs((data) => {
      useInstrumentStore.getState().applySpotAssetCtxs(data);
    });
  }, []);

  useSubscription(() => {
    return hlSubClient.allDexsAssetCtxs((data) => {
      useInstrumentStore.getState().applyAllDexsAssetCtxs(data.ctxs);
    });
  }, []);

  return children;
};

export default TradingInstrumentProvider;
