import { defaultSpotAsset } from "../constants";

export const getTradePathParams = (slug?: string[]) => {
  const slugs = slug ?? [];

  const [baseAsset, quoteAsset] = slugs;

  if (slugs.length > 2 || !baseAsset || !quoteAsset) {
    return { ...defaultSpotAsset, redirect: true };
  }

  return {
    baseAsset,
    quoteAsset,
    redirect: false,
  };
};
