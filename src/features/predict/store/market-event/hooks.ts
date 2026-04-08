import { useContext } from "react";
import { useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";

import { MarketEventContext, MarketEventStoreState } from "./store";

export const useMarketEventContext = <T>(
  selector: (state: MarketEventStoreState) => T,
): T => {
  const store = useContext(MarketEventContext);
  if (!store)
    throw new Error("Missing MarketEventContext.Provider in the tree");

  return useStore(store, useShallow(selector));
};
