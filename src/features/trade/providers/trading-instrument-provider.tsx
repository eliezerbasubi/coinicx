"use client";

import React from "react";

import { useSubscription } from "@/hooks/useSubscription";
import { hlSubClient } from "@/services/transport";
import { useInstrumentStore } from "@/store/trade/instrument";

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
