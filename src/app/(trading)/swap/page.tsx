import { Metadata } from "next";

import Swap from "@/features/swap";

export const metadata: Metadata = {
  title: "Swap",
  description:
    "Swap spot tokens instantly. Trade any token pair with deep liquidity and minimal slippage.",
};

const SwapPage = () => {
  return <Swap />;
};

export default SwapPage;
