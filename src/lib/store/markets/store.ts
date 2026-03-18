import { createContext } from "react";
import { create } from "zustand";

import {
  AssetType,
  ICryptoCurrency,
  ICurrency,
  MarketType,
  TokenInputType,
} from "@/lib/types/market";

export type AssetsByTokenInputType = Record<
  TokenInputType,
  { list: Array<ICurrency | ICryptoCurrency>; assetType: AssetType }
>;

type SelectedAssets = Record<AssetType, ICurrency> & {
  cryptoAssetDetails?: ICryptoCurrency;
};

export interface CryptoMarketProps {
  marketType: MarketType;
  isLoadingAssets: boolean;
  marketAssets: Record<MarketType, AssetsByTokenInputType>;
  selectedAssets?: SelectedAssets;
}

export interface CryptoMarketState extends CryptoMarketProps {
  setSelectedAssets: (assets: Partial<SelectedAssets>) => void;
  setMarketType: (marketType: MarketType) => void;
}

export const createCryptoMarketStore = (initialProps: CryptoMarketProps) => {
  return create<CryptoMarketState>()((set) => ({
    ...initialProps,
    setMarketType: (marketType) => set({ marketType }),
    setSelectedAssets: (assets) =>
      set((state) => ({
        selectedAssets: state.selectedAssets
          ? { ...state.selectedAssets, ...assets }
          : undefined,
      })),
  }));
};

export type CryptoMarketStore = ReturnType<typeof createCryptoMarketStore>;
export const CryptoMarketContext = createContext<CryptoMarketStore | null>(
  null,
);
