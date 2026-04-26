import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

export type AccountTransactVariant = "deposit" | "withdraw" | "transfer";

interface AccountTransactStore {
  open: boolean;
  swapModalOpen: boolean;
  variant: AccountTransactVariant;

  /** The quote asset for transfer and swap */
  swapQuoteAsset?: string;
  openSwapModal: (swapQuoteAsset: string) => void;
  closeSwapModal: () => void;
  openAccountTransact: (variant: AccountTransactVariant) => void;
  closeAccountTransact: () => void;
}

export const useAccountTransactStore = create<AccountTransactStore>((set) => ({
  open: false,
  swapModalOpen: false,
  variant: "deposit",
  openAccountTransact: (variant) => set({ open: true, variant }),
  closeAccountTransact: () => set({ open: false }),
  openSwapModal: (swapQuoteAsset) =>
    set({ swapModalOpen: true, swapQuoteAsset }),
  closeSwapModal: () => set({ swapModalOpen: false }),
}));

export const useShallowAccountTransactStore = <T>(
  selector: (state: AccountTransactStore) => T,
) => {
  return useAccountTransactStore(useShallow(selector));
};
