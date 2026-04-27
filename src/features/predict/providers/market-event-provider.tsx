"use client";

import React from "react";
import { notFound } from "next/navigation";

import PredictEventPageSkeleton from "@/features/predict/components/PredictEventPageSkeleton";
import { useSpotMetas } from "@/features/predict/hooks/useSpotMetas";
import MarketEventStoreProvider from "@/features/predict/lib/store/market-event/provider";

import { useMarketEvent } from "../hooks/useMarketEvent";
import MarketEventCtxProvider from "./market-event-ctx-provider";
import UserPredictionProvider from "./user-prediction-provider";

type Props = {
  children: React.ReactNode;
  slug: string;
};

const MarketEventProvider = ({ children, slug }: Props) => {
  const { data, status } = useMarketEvent(slug);

  useSpotMetas({
    // We only want to fetch spot meta for recurring events.
    // TODO: Check if we could enforce the restriction to recurring events where the class property is set to priceBinary.
    enabled: data?.type === "recurring",

    // We are just prefetching here, we don't want the component to re-render when the spot meta is updated.
    notifyOnChangeProps: [],
  });

  if (status === "loading") return <PredictEventPageSkeleton />;

  if (!data) return notFound();

  return (
    <MarketEventStoreProvider marketEventMeta={data}>
      <MarketEventCtxProvider />
      <UserPredictionProvider>{children}</UserPredictionProvider>
    </MarketEventStoreProvider>
  );
};

export default MarketEventProvider;
