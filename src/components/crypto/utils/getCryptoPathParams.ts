import { MarketType } from "@/types/market";

import {
  defaultAssetsCode,
  defaultMarketType,
  supportedPaths,
} from "../constants";

export const getCryptoPathParams = (slug?: string[]) => {
  const [marketType, fiat, crypto] = slug ?? [];

  const isSupportedType = supportedPaths.includes(
    marketType?.toLocaleLowerCase() as MarketType,
  );

  if (!isSupportedType || !fiat || !crypto) {
    return {
      marketType: !isSupportedType
        ? defaultMarketType
        : (marketType as MarketType),
      fiat: defaultAssetsCode.fiat,
      crypto: defaultAssetsCode.crypto,
      redirect: true,
    };
  }

  return {
    marketType: marketType as MarketType,
    fiat,
    crypto,
  };
};
