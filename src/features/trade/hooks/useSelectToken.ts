import { ROUTES } from "@/lib/constants/routes";
import { Asset } from "@/lib/types/trade";
import { useTradeContext } from "@/features/trade/store/hooks";

export const useSelectToken = () => {
  const onAssetChange = useTradeContext((s) => s.onAssetChange);

  const updateUrlState = (params: {
    isSpot: boolean;
    base: string;
    quote: string;
  }) => {
    const newPath = params.isSpot
      ? [ROUTES.trade.spot, params.base, params.quote]
      : [ROUTES.trade.perps, params.base];

    window.history.replaceState({}, "", newPath.join("/"));
  };

  /**
   * Set details of the current token from asset info.
   *
   * @param assetInfo
   */
  const selectTokenFromAssetInfo = (assetInfo: Asset) => {
    const price = assetInfo.midPx ?? assetInfo.markPx;

    onAssetChange({
      base: assetInfo.base,
      quote: assetInfo.quote,
      coin: assetInfo.coin,
      price,
      szDecimals: assetInfo.szDecimals,
      dex: assetInfo.dex,
      perpDexIndex: assetInfo.perpDexIndex,
      instrumentType: assetInfo.isSpot ? "spot" : "perps",
      assetIndex: assetInfo.index,
    });

    updateUrlState({
      isSpot: assetInfo.isSpot,
      base: assetInfo.isSpot ? assetInfo.base : assetInfo.coin,
      quote: assetInfo.quote,
    });
  };

  return {
    selectTokenFromAssetInfo,
  };
};
