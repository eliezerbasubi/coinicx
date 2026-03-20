import { InstrumentType } from "@/lib/types/trade";

import { DEFAULT_PERPS_ASSETS, DEFAULT_SPOT_ASSETS } from "../constants";

export const getTradePathParams = (
  slug?: string[],
): {
  base: string;
  quote?: string;
  type: InstrumentType;
  redirect: boolean;
} => {
  const slugs = slug ?? [];

  const [type, ...assets] = slugs;

  const [base, quote] = assets;

  if (type !== "perps" && type !== "spot") {
    return {
      base: DEFAULT_PERPS_ASSETS.base,
      type: type as InstrumentType,
      redirect: true,
    };
  }

  if (type === "spot" && (!base || !quote)) {
    return { ...DEFAULT_SPOT_ASSETS, type, redirect: true };
  }

  if (type === "perps" && base && quote) {
    return { base, type, redirect: true };
  }

  return {
    type,
    base: decodeURIComponent(base),
    quote: quote ? decodeURIComponent(quote) : quote,
    redirect: false,
  };
};
