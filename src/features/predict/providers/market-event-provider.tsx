"use client";

import React, { use, useMemo } from "react";
import { notFound } from "next/navigation";

import { useMarketEvents } from "../hooks/useMarketEvents";
import { useSpotMetas } from "../hooks/useSpotMetas";
import MarketEventStoreProvider from "../store/market-event/provider";
import { parseRecurringMetadata } from "../utils/parseMetadata";

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

const MarketEventProvider = ({ children, params }: Props) => {
  const { slug } = use(params);

  const { isLoading, error, getMarketEventBySlug } = useMarketEvents();

  const marketEvent = getMarketEventBySlug(decodeURIComponent(slug as string));

  useSpotMetas({
    // We only want to fetch spot meta for recurring events.
    // TODO: Check if we could enforce the restriction to recurring events where the class property is set to priceBinary.
    enabled: marketEvent?.type === "recurring",

    // We are just prefetching here, we don't want the component to re-render when the spot meta is updated.
    notifyOnChangeProps: [],
  });

  // TODO: use useSuspenseQuery in useMarketEvents so that we don't need to handle the loading state here.
  if (isLoading) return <div>Loading...</div>;

  if (error) return <div>Error...</div>;

  if (!marketEvent) return notFound();

  const parsedMetadata = parseRecurringMetadata(
    marketEvent.description,
    marketEvent.resolution,
  );

  return (
    <MarketEventStoreProvider
      marketEvent={{
        ...marketEvent,
        ...parsedMetadata,
        title:
          marketEvent.type === "recurring"
            ? parsedMetadata.title
            : marketEvent.title,
      }}
    >
      {children}
    </MarketEventStoreProvider>
  );
};

export default MarketEventProvider;
