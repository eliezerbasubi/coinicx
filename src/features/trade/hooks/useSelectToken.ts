import { ROUTES } from "@/lib/constants/routes";
import { useTradeContext } from "@/lib/store/trade/hooks";
import { Asset, InstrumentType } from "@/lib/types/trade";

import { useAssetMetas } from "./useAssetMetas";

export const useSelectToken = () => {
  const { getTokenMeta } = useAssetMetas();

  const { onAssetChange } = useTradeContext((s) => ({
    onAssetChange: s.onAssetChange,
  }));

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

  /**
   * Set details of the current token from quote and base assets.
   * @note This function does not set the price of the asset.
   *
   * @param data
   */
  const selectTokenFromData = (data: {
    instrumentType: InstrumentType;
    baseAsset: string;
    quoteAsset: string;
  }) => {
    const meta = getTokenMeta(
      data.instrumentType,
      data.baseAsset,
      data.quoteAsset,
    );

    if (!meta) throw new Error("No asset meta provided");

    onAssetChange({
      base: data.baseAsset,
      quote: data.quoteAsset,
      coin: meta.coin,
      price: 0,
      szDecimals: meta.szDecimals,
      dex: meta.dex,
      perpDexIndex: meta.perpDexIndex,
      instrumentType: data.instrumentType,
      assetIndex: meta.universeIndex ?? meta.index,
    });

    const isSpot = data.instrumentType === "spot";

    updateUrlState({
      isSpot,
      base: isSpot ? data.baseAsset : meta.coin,
      quote: data.quoteAsset,
    });
  };

  return {
    selectTokenFromAssetInfo,
    selectTokenFromData,
  };
};
