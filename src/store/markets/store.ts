import { createContext } from "react";
import { create } from "zustand";

import { AssetType, ICurrency, MarketType } from "@/types/market";

export type AssetsByTokenType = Record<
  "tokenIn" | "tokenOut",
  { list: Array<ICurrency>; assetType: AssetType }
>;

export interface CryptoMarketProps {
  marketType: MarketType;
  isLoadingAssets: boolean;
  assetsByTokenType: AssetsByTokenType;
  selectedAssets?: Record<AssetType, ICurrency>;
}

export interface CryptoMarketState extends CryptoMarketProps {
  setSelectedAssets: (assets: Partial<Record<AssetType, ICurrency>>) => void;
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
    // setSelectedAssets: (assets) =>
    //   set((state) => ({
    //     selectedAssets: { ...state.selectedAssets, ...assets },
    //   })),
  }));
};

export type CryptoMarketStore = ReturnType<typeof createCryptoMarketStore>;
export const CryptoMarketContext = createContext<CryptoMarketStore | null>(
  null,
);
