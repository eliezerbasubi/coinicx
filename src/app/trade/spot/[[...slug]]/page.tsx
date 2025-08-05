import React from "react";

import SpotTrade from "@/components/trade";
import { getTradePathParams } from "@/components/trade/utils/getTradePathParams";

type Props = {
  params: Promise<{ slug: string[] }>;
};

const SpotTradePage = async ({ params }: Props) => {
  const { slug } = await params;
  const pathParams = getTradePathParams(slug);

  return <SpotTrade />;
};

export default SpotTradePage;
