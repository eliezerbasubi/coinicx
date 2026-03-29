import { useCallback } from "react";

import { ROUTES } from "@/lib/constants/routes";
import { useAssetMetas } from "@/features/trade/hooks/useAssetMetas";
import {
  formatSymbol,
  parseBuilderDeployedAsset,
} from "@/features/trade/utils";

export const useSpotToTokenDetails = () => {
  const { spotMeta, spotNamesToTokens } = useAssetMetas();

  const mapSpotNameToTokenDetails = useCallback(
    (coin: string) => {
      const spotInfo = spotNamesToTokens?.get(coin);

      if (spotInfo && spotMeta) {
        const quote = spotMeta.tokens[spotInfo.quoteToken].name;
        const base = spotMeta.tokens[spotInfo.baseToken].name;

        return {
          href: `${ROUTES.trade.spot}/${base}/${quote}`,
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
