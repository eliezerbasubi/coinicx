import { create } from "zustand";
import { persist } from "zustand/middleware";

type FavouriteStore = {
  favourites: string[];
  toggleFavourite: (symbol: string) => void;
};

export const useFavouriteStore = create<FavouriteStore>()(
  persist(
    (set, get) => ({
      favourites: [],
      toggleFavourite(symbol) {
        const { favourites } = get();

        const newFavourites = favourites.includes(symbol)
          ? favourites.filter((favourite) => favourite !== symbol)
          : [...favourites, symbol];
        set({ favourites: newFavourites });
      },
    }),
    { name: "FAVOURITES_SYMBOLS" },
  ),
);
