import { create } from "zustand";

import { KlineIndicator, KlineIndicatorLayout } from "../types";
import { INDICATORS } from "../utils/constants";

type kLineState = {
  indicatorsLayout: Array<KlineIndicatorLayout>;
  addIndicator: (indicator: KlineIndicator, type: string) => void;
  removeIndicator: (index: number) => void;
};

const defaultIndicators: Array<KlineIndicatorLayout> = [
  { indicators: [INDICATORS.MA], type: "CANDLE" },
  { indicators: [], type: "VOL" },
];

export const useKlineStore = create<kLineState>((set, get) => ({
  indicatorsLayout: defaultIndicators,
  addIndicator: (indicator, type) => {
    const { indicatorsLayout } = get();

    const layout = [...indicatorsLayout].find((ind) => ind.type === type);

    if (layout) {
      layout.indicators = [...layout.indicators, indicator];

      set({ indicatorsLayout });
    }
    // set((state) => ({ indicators: [...state.indicators, indicator] }))
  },
  removeIndicator: (index) => {
    const { indicatorsLayout } = get();

    const items = [...indicatorsLayout];
    items.splice(index, 1);
    set({ indicatorsLayout: items });
  },
}));
