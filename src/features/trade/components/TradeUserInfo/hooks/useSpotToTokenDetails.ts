import { useCallback } from "react";

import { ROUTES } from "@/constants/routes";
import { useMetaAndAssetCtxs } from "@/features/trade/hooks/useMetaAndAssetCtxs";
import {
  formatSymbol,
  parseBuilderDeployedAsset,
} from "@/features/trade/utils";

export const useSpotToTokenDetails = () => {
  const { spotMeta, spotNamesToTokens } = useMetaAndAssetCtxs();

  const mapSpotNameToTokenDetails = useCallback(
    (coin: string) => {
      const spotInfo = spotNamesToTokens?.get(coin);

      if (spotInfo && spotMeta) {
        const quote = spotMeta.tokens[spotInfo.quoteToken].name;
        const base = spotMeta.tokens[spotInfo.baseToken].name;

        return {
          href: `${ROUTES.trade.perps}/${base}/${quote}`,
          quote,
          base,
          coin,
          dex: null,
          symbol: formatSymbol(base, quote, true),
          isSpot: true,
        };
      }

      const asset = parseBuilderDeployedAsset(coin);

      return {
        href: `${ROUTES.trade.perps}/${coin}`,
        ...asset,
        quote: null,
        coin,
        symbol: asset.base,
        isSpot: false,
      };
    },
    [spotMeta, spotNamesToTokens],
  );

  return { mapSpotNameToTokenDetails };
};
