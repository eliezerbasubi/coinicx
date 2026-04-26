import React, { use } from "react";

import MarketEventProvider from "@/features/predict/providers/market-event-provider";

const MarketEventLayout = ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = use(params);

  return <MarketEventProvider slug={slug}>{children}</MarketEventProvider>;
};

export default MarketEventLayout;
