import { useContext } from "react";
import { useStore } from "zustand";

import { TradeContext, TradeStoreState } from "./store";

export const useTradeContext = <T>(
  selector: (state: TradeStoreState) => T,
): T => {
  const store = useContext(TradeContext);
  if (!store) throw new Error("Missing SpotTradeContext.Provider in the tree");

  return useStore(store, selector);
};
