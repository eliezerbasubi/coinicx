"use client";

import React, { useMemo } from "react";
import { redirect } from "next/navigation";
import { useQueries } from "@tanstack/react-query";

import { ICurrency, MarketType } from "@/types/market";
import FIAT_CURRENCIES from "@/lib/mocks/fiat.json";
import { defaultAssetsCode } from "@/constants/markets";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { ROUTES } from "@/constants/routes";
import { getCryptoCurrencies, getExchangeRates } from "@/services/markets";
import CryptoMarketStoreProvider from "@/store/markets/provider";
import { AssetsByTokenType } from "@/store/markets/store";

import { useFetchData } from "../hooks";

type Props = {
  marketType: MarketType;
  fiatAssetCode: string;
  cryptoAssetCode: string;
};

const findAsset = (list: ICurrency[], assetCode: string) => {
  const lowerTarget = assetCode.toLowerCase();

  return list.find((item) => item.assetCode.toLowerCase() === lowerTarget);
};

const CryptoMarketProvider = ({
  marketType,
  fiatAssetCode,
  cryptoAssetCode,
  children,
}: React.PropsWithChildren<Props>) => {
  const [{ data, isLoading, status }] = useFetchData();

  const cryptoList: ICurrency[] = useMemo(() => {
    if (!data) return [];

    return data.map((datum) => ({
      id: datum.id,
      assetCode: datum.symbol,
      assetName: datum.name,
      assetLogo: datum.image,
      symbol: datum.symbol,
    }));
  }, [data]);

  const assetsByTokenType: AssetsByTokenType = useMemo(() => {
    if (marketType === "sell") {
      return {
        tokenIn: {
          list: cryptoList,
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
        list: cryptoList,
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

    return { crypto, fiat };
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
