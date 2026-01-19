export const isBuilderDeployedAsset = (asset: string) => {
  return asset.includes(":");
};

export const parseBuilderDeployedAsset = (coin: string) => {
  if (isBuilderDeployedAsset(coin)) {
    const [dex, base] = coin.split(":");
    return { dex, base };
  }

  return { dex: "", base: coin };
};

export const parseQuoteAsset = (quote?: string) => {
  if (!quote || quote.includes("/USDC")) return "USDC";

  return quote;
};
