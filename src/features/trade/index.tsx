"use client";

import dynamic from "next/dynamic";

import { useIsMobile, useIsTablet } from "@/hooks/useIsMobile";

import TradingLoading from "./loading";

const TradingMobileLayout = dynamic(() => import("./layouts/mobile"), {
  ssr: false,
  loading: () => <TradingLoading />,
});

const TradingTabletLayout = dynamic(() => import("./layouts/tablet"), {
  ssr: false,
  loading: () => <TradingLoading />,
});

const TradingDesktopLayout = dynamic(() => import("./layouts/desktop"), {
  ssr: false,
  loading: () => <TradingLoading />,
});

const Trade = () => {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  if (isMobile) return <TradingMobileLayout />;

  if (isTablet) return <TradingTabletLayout />;

  return <TradingDesktopLayout />;
};

export default Trade;
