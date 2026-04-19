import { useContext } from "react";
import { useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";

import { TradeContext, TradeStoreState } from ".";

export const useTradeContext = <T>(
  selector: (state: TradeStoreState) => T,
): T => {
  const store = useContext(TradeContext);
  if (!store) throw new Error("Missing TradeContext.Provider in the tree");

  return useStore(store, useShallow(selector));
};
