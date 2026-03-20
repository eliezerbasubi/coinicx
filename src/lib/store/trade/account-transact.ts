import { create } from "zustand";

export type AccountTransactVariant = "deposit" | "withdraw" | "transfer";

interface AccountTransactStore {
  open: boolean;
  variant: AccountTransactVariant;
  openAccountTransact: (variant: AccountTransactVariant) => void;
  closeAccountTransact: () => void;
}

export const useAccountTransactStore = create<AccountTransactStore>((set) => ({
  open: false,
  variant: "deposit",
  openAccountTransact: (variant) => set({ open: true, variant }),
  closeAccountTransact: () => set({ open: false }),
}));
