import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

interface InfoSectionStore {
  activeTab: string;
  twapActiveTab: string;
  setActiveTab: (tab: string) => void;
  setTwapActiveTab: (tab: string) => void;
}

export const useInfoSectionStore = create<InfoSectionStore>()(
  persist(
    (set) => ({
      activeTab: "balances",
      twapActiveTab: "active",
      setActiveTab: (tab) => set({ activeTab: tab }),
      setTwapActiveTab: (tab) => set({ twapActiveTab: tab }),
    }),
    {
      name: "trade-info-section",
    },
  ),
);

export const useShallowInfoSectionStore = <T>(
  selector: (state: InfoSectionStore) => T,
) => {
  return useInfoSectionStore(useShallow(selector));
};
