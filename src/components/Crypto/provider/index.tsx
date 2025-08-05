"use client";

import React, { useMemo } from "react";
import { redirect } from "next/navigation";

import { ICryptoCurrency, ICurrency, MarketType } from "@/types/market";
import FIAT_CURRENCIES from "@/lib/mocks/fiat.json";
import { ROUTES } from "@/constants/routes";
import CryptoMarketStoreProvider from "@/store/markets/provider";
import { AssetsByTokenInputType } from "@/store/markets/store";

import { defaultAssetsCode } from "../constants";
import { useFetchData } from "../hooks";
import { mapCryptoToAssetCurrency } from "../utils/mapCryptoToAssetCurrency";

type Props = {
  marketType: MarketType;
  fiatAssetCode: string;
  cryptoAssetCode: string;
};

const findAsset = (
  list: Array<ICurrency | ICryptoCurrency>,
  assetCode: string,
) => {
  const lowerTarget = assetCode.toLowerCase();

  const asset = list.find((item) =>
    "assetCode" in item
      ? item.assetCode.toLowerCase() === lowerTarget
      : item.symbol.toLowerCase() === lowerTarget,
  );

  return asset;
};

const CryptoMarketProvider = ({
  marketType,
  fiatAssetCode,
  cryptoAssetCode,
  children,
}: React.PropsWithChildren<Props>) => {
  const [{ data: cryptoList, isLoading, status }] = useFetchData();

  const marketAssets: Record<MarketType, AssetsByTokenInputType> =
    useMemo(() => {
      return {
        buy: {
          tokenIn: {
            list: FIAT_CURRENCIES,
            assetType: "fiat",
          },
          tokenOut: {
            list: cryptoList ?? [],
            assetType: "crypto",
          },
        },
        sell: {
          tokenIn: {
            list: cryptoList ?? [],
            assetType: "crypto",
          },
          tokenOut: {
            list: FIAT_CURRENCIES,
            assetType: "fiat",
          },
        },
      };
    }, [marketType, cryptoList]);

  const assetsByTokenType = marketAssets[marketType];

  const defaultSelectedAssets = useMemo(() => {
    const crypto = findAsset(
      assetsByTokenType.tokenIn.assetType === "crypto"
        ? assetsByTokenType.tokenIn.list
        : assetsByTokenType.tokenOut.list,
      cryptoAssetCode,
    );
    const fiat = findAsset(
      assetsByTokenType.tokenIn.assetType === "fiat"
        ? assetsByTokenType.tokenIn.list
        : assetsByTokenType.tokenOut.list,
      fiatAssetCode,
    );

    if (!crypto || !fiat) {
      return undefined;
    }

    return {
      cryptoAssetDetails: crypto as ICryptoCurrency,
      crypto: mapCryptoToAssetCurrency(crypto as ICryptoCurrency),
      fiat: fiat as ICurrency,
    };
  }, [assetsByTokenType, fiatAssetCode, cryptoAssetCode]);

  // Redirect to default assets if the current asset is not supported
  if (status !== "pending" && !defaultSelectedAssets) {
    return redirect(
      `${ROUTES.crypto.index}/${marketType}/${defaultAssetsCode.fiat}/${defaultAssetsCode.crypto}`,
    );
  }

  return (
    <CryptoMarketStoreProvider
      marketType={marketType}
      isLoadingAssets={isLoading}
      selectedAssets={defaultSelectedAssets}
      marketAssets={marketAssets}
    >
      {children}
    </CryptoMarketStoreProvider>
  );
};

export default CryptoMarketProvider;
