import { ICryptoCurrency, ICurrency } from "@/types/market";

export const mapCryptoToAssetCurrency = (
  asset: ICryptoCurrency,
): ICurrency => ({
  id: asset.id,
  assetCode: asset.symbol,
  assetName: asset.name,
  assetLogo: asset.image,
  symbol: asset.symbol,
});
