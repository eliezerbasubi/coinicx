import React from "react";

import MarketEventProvider from "@/features/predict/providers/market-event-provider";

const MarketEventLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) => {
  return <MarketEventProvider params={params}>{children}</MarketEventProvider>;
};

export default MarketEventLayout;
