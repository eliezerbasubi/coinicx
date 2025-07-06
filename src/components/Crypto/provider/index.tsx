"use client";

import React, { useMemo } from "react";
import { redirect } from "next/navigation";

import { ICryptoCurrency, ICurrency, MarketType } from "@/types/market";
import FIAT_CURRENCIES from "@/lib/mocks/fiat.json";
import { defaultAssetsCode } from "@/constants/markets";
import { ROUTES } from "@/constants/routes";
import CryptoMarketStoreProvider from "@/store/markets/provider";
import { AssetsByTokenType } from "@/store/markets/store";

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

  const assetsByTokenType: AssetsByTokenType = useMemo(() => {
    if (marketType === "sell") {
      return {
        tokenIn: {
          list: cryptoList ?? [],
          assetType: "crypto",
        },
        tokenOut: {
          list: FIAT_CURRENCIES,
          assetType: "fiat",
        },
      };
    }
    return {
      tokenIn: {
        list: FIAT_CURRENCIES,
        assetType: "fiat",
      },
      tokenOut: {
        list: cryptoList ?? [],
        assetType: "crypto",
      },
    };
  }, [marketType, cryptoList]);

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
      assetsByTokenType={assetsByTokenType}
    >
      {children}
    </CryptoMarketStoreProvider>
  );
};

export default CryptoMarketProvider;
