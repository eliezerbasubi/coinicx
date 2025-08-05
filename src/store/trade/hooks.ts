import { useContext } from "react";
import { useStore } from "zustand";

import { SpotTradeContext, SpotTradeState } from "./spot";

export const useSpotTradeContext = <T>(
  selector: (state: SpotTradeState) => T,
): T => {
  const store = useContext(SpotTradeContext);
  if (!store) throw new Error("Missing SpotTradeContext.Provider in the tree");

  return useStore(store, selector);
};
