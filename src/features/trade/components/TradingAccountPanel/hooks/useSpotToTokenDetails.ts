import { useCallback } from "react";

import { ROUTES } from "@/lib/constants/routes";
import { usePredictionsMetas } from "@/features/predict/hooks/usePredictionsMetas";
import { mapCoinToMarketEventSpec } from "@/features/predict/lib/utils/mapper";
import { useAssetMetas } from "@/features/trade/hooks/useAssetMetas";
import {
  formatSymbol,
  parseBuilderDeployedAsset,
} from "@/features/trade/utils";

export const useSpotToTokenDetails = () => {
  const { data: predictionsMetas, isLoading: isLoadingPredictionsMetas } =
    usePredictionsMetas();
  const {
    spotMeta,
    spotNamesToTokens,
    isLoading: isLoadingSpotMetas,
  } = useAssetMetas();

  const mapSpotNameToTokenDetails = useCallback(
    (coin: string) => {
      const outcomeMeta = mapCoinToMarketEventSpec(coin, predictionsMetas);

      if (outcomeMeta) {
        return {
          href: `${ROUTES.predict.event}/${outcomeMeta.slug}`,
          quote: outcomeMeta.quote,
          base: outcomeMeta.sideName,
          dex: null,
          coin,
          symbol: outcomeMeta.title,
          isSpot: true,
          type: "outcome",
        };
      }

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
          type: "spot",
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
        type: "perps",
      };
    },
    [spotMeta, spotNamesToTokens, predictionsMetas],
  );

  return {
    mapSpotNameToTokenDetails,
    isLoading: isLoadingPredictionsMetas || isLoadingSpotMetas,
  };
};
