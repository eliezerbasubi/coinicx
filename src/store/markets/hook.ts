import { useContext } from "react";
import { useStore } from "zustand";

import { CryptoMarketContext, CryptoMarketState } from "./store";

export const useCryptoMarketContext = <T>(
  selector: (state: CryptoMarketState) => T,
): T => {
  const store = useContext(CryptoMarketContext);
  if (!store)
    throw new Error("Missing CryptoMarketContext.Provider in the tree");

  return useStore(store, selector);
};
