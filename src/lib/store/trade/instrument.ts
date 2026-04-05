import {
  ActiveAssetCtxWsEvent,
  ActiveSpotAssetCtxWsEvent,
  AllDexsAssetCtxsWsEvent,
  SpotAssetCtxsWsEvent,
} from "@nktkas/hyperliquid";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

import { QUERY_KEYS } from "@/lib/constants/queryKeys";
import {
  AllPerpMetas,
  AssetCxt,
  AssetMeta,
  SpotMetas,
} from "@/lib/types/trade";
import { getQueryClient } from "@/lib/utils/getQueryClient";
import {
  mapDataToAssetCtx,
  mapPerpDataToAssetMeta,
  mapSpotDataToAssetMeta,
  parseBuilderDeployedAsset,
} from "@/features/trade/utils";

type SpotAssetCtx = Record<string, SpotAssetCtxsWsEvent[number]>;

interface InstrumentStoreState {
  assetMeta: AssetMeta | null;
  assetCtx: AssetCxt | null;
  spotAssetCtxs: SpotAssetCtx;
  allDexsAssetCtxs: AllDexsAssetCtxsWsEvent["ctxs"];
  setTokenMeta: (meta: AssetMeta) => void;
  setAssetCtx: (
    data: ActiveSpotAssetCtxWsEvent["ctx"] | ActiveAssetCtxWsEvent["ctx"],
  ) => void;
  setTokenMetaAndAssetCtx: (params: {
    dex: string;
    perpDexIndex: number;
    assetIndex: number;
    isSpot: boolean;
  }) => void;
  applySpotAssetCtxs: (data: SpotAssetCtxsWsEvent) => void;
  applyAllDexsAssetCtxs: (data: AllDexsAssetCtxsWsEvent["ctxs"]) => void;
}

export const useInstrumentStore = create<InstrumentStoreState>()(
  (set, get) => ({
    assetMeta: null,
    assetCtx: null,
    spotAssetCtxs: {},
    allDexsAssetCtxs: [],
    setTokenMeta: (meta) => set({ assetMeta: meta }),
    setAssetCtx: (data) => {
      set({ assetCtx: mapDataToAssetCtx(data) });
    },
    setTokenMetaAndAssetCtx(params) {
      const { allDexsAssetCtxs, spotAssetCtxs } = get();
      const queryClient = getQueryClient();

      const allPerpMetas = queryClient.getQueryData<AllPerpMetas>([
        QUERY_KEYS.allPerpMetas,
      ]);
      const spotMetas = queryClient.getQueryData<SpotMetas>([
        QUERY_KEYS.spotMeta,
      ]);

      if (!allPerpMetas || !spotMetas) return;

      const spotMeta = spotMetas.spotMeta;

      if (params.isSpot) {
        const universe = spotMeta.universe[params.assetIndex];
        const ctx = spotAssetCtxs[universe.index];

        if (!universe || !ctx) return;

        const [baseIndex, quoteIndex] = universe.tokens;

        set({
          assetMeta: mapSpotDataToAssetMeta(
            universe,
            spotMeta.tokens[baseIndex],
            spotMeta.tokens[quoteIndex].name,
          ),
          assetCtx: mapDataToAssetCtx(ctx),
        });
      } else {
        const perpDexState = allPerpMetas[params.perpDexIndex];
        const perpMeta = perpDexState.universe[params.assetIndex];

        const dexCtxState = new Map(allDexsAssetCtxs).get(perpDexState.dex);

        if (!perpMeta || !dexCtxState) return;

        const ctx = dexCtxState[params.assetIndex];

        set({
          assetMeta: mapPerpDataToAssetMeta({
            ...parseBuilderDeployedAsset(perpMeta.name),
            universe: perpMeta,
            index: params.assetIndex,
            perpDexIndex: params.perpDexIndex,
            quote: spotMeta.tokens[perpDexState.collateralToken].name,
          }),
          assetCtx: mapDataToAssetCtx(ctx),
        });
      }
    },
    applySpotAssetCtxs(data) {
      const spotAssetCtxs = data.reduce(
        (acc, curr) => {
          acc[curr.coin] = curr;
          return acc;
        },
        {} as Record<string, SpotAssetCtxsWsEvent[number]>,
      );

      set({ spotAssetCtxs });
    },
    applyAllDexsAssetCtxs(data) {
      set({ allDexsAssetCtxs: data });
    },
  }),
);

export const useShallowInstrumentStore = <T>(
  selector: (state: InstrumentStoreState) => T,
) => {
  return useInstrumentStore(useShallow(selector));
};
