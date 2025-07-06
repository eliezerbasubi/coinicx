import { createContext } from "react";
import { create } from "zustand";

import {
  AssetType,
  ICryptoCurrency,
  ICurrency,
  MarketType,
} from "@/types/market";

export type AssetsByTokenType = Record<
  "tokenIn" | "tokenOut",
  { list: Array<ICurrency | ICryptoCurrency>; assetType: AssetType }
>;

type SelectedAssets = Record<AssetType, ICurrency> & {
  cryptoAssetDetails?: ICryptoCurrency;
};

export interface CryptoMarketProps {
  marketType: MarketType;
  isLoadingAssets: boolean;
  assetsByTokenType: AssetsByTokenType;
  selectedAssets?: SelectedAssets;
}

export interface CryptoMarketState extends CryptoMarketProps {
  setSelectedAssets: (assets: Partial<SelectedAssets>) => void;
}

export const createCryptoMarketStore = (initialProps: CryptoMarketProps) => {
  return create<CryptoMarketState>()((set) => ({
    ...initialProps,
    setSelectedAssets(assets) {
      return set((state) => ({
        selectedAssets: state.selectedAssets
          ? { ...state.selectedAssets, ...assets }
          : undefined,
      }));
    },
  }));
};

export type CryptoMarketStore = ReturnType<typeof createCryptoMarketStore>;
export const CryptoMarketContext = createContext<CryptoMarketStore | null>(
  null,
);
