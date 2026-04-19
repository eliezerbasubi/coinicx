import { createContext } from "react";
import {
  ActiveAssetCtxWsEvent,
  ActiveSpotAssetCtxWsEvent,
  AllPerpMetasResponse,
  SpotMetaResponse,
} from "@nktkas/hyperliquid";
import { create } from "zustand";

import { QUERY_KEYS } from "@/lib/constants/queryKeys";
import { useInstrumentStore } from "@/lib/store/trade/instrument";
import { useOrderFormStore } from "@/lib/store/trade/order-form";
import { useOrderBookStore } from "@/lib/store/trade/orderbook";
import { AssetCxt, AssetMeta, InstrumentType } from "@/lib/types/trade";
import { getQueryClient } from "@/lib/utils/getQueryClient";
import {
  getPriceDecimals,
  mapDataToAssetCtx,
  mapPerpDataToAssetMeta,
  mapSpotDataToAssetMeta,
  parseBuilderDeployedAsset,
} from "@/features/trade/utils";

type State = {
  swapModalOpen: boolean;
  assetCtx: AssetCxt;
  assetMeta: AssetMeta;
  instrumentType: InstrumentType;
};

export type TradeStoreProps = Pick<State, "assetMeta" | "instrumentType">;

type Actions = {
  onAssetChange: (data: {
    base: string;
    quote: string;
    coin: string;
    instrumentType: InstrumentType;
    /** Price of the asset (midPx or markPx) to build price decimals and orderbook ticks */
    price: number;
    /** Decimals of the asset */
    szDecimals: number;
    /** Dex of the asset */
    dex?: string | null;
    /** Perp dex index of the asset */
    perpDexIndex?: number;
    /** Index of the asset */
    assetIndex?: number;
  }) => void;
  openSwapModal: (open?: boolean) => void;
  setAssetCtx: (
    assetCtx: ActiveSpotAssetCtxWsEvent["ctx"] | ActiveAssetCtxWsEvent["ctx"],
  ) => void;
  setAssetMeta: (assetMeta: Partial<AssetMeta>) => void;
};

export interface TradeStoreState extends State, Actions {
  getState: () => State & Actions;
}

const defaultAssetCtx = {
  dayNtlVlm: 0,
  dayBaseVlm: 0,
  openInterest: null,
  marketCap: null,
  funding: null,
  prevDayPx: 0,
  midPx: 0,
  markPx: 0,
  oraclePx: null,
  referencePx: 0,
};

export const createTradeStore = (initialProps: TradeStoreProps) => {
  return create<TradeStoreState>()((set, get) => ({
    ...initialProps,
    swapModalOpen: false,
    assetCtx: defaultAssetCtx,
    getState: () => {
      const { getState, ...state } = get();

      return state;
    },
    setAssetCtx: (data) => set({ assetCtx: mapDataToAssetCtx(data) }),
    setAssetMeta: (assetMeta) =>
      set((state) => ({ assetMeta: { ...state.assetMeta, ...assetMeta } })),
    onAssetChange: (data) => {
      const isSpot = data.instrumentType === "spot";

      // Reset order form
      useOrderFormStore.getState().reset();

      // Ensure ticks are only loaded once asset is selected
      useOrderBookStore
        .getState()
        .setTicks(data.price, data.szDecimals, isSpot);

      // Calculate price decimals
      const pxDecimals = data.price
        ? getPriceDecimals(data.price, data.szDecimals, isSpot)
        : null;

      // Update asset meta and context
      const assetData = getTokenMetaAndAssetCtx({
        dex: data.dex ?? "",
        perpDexIndex: data.perpDexIndex ?? 0,
        assetIndex: data.assetIndex ?? 0,
        isSpot,
      });

      if (!assetData) return;

      set({
        assetCtx: assetData.assetCtx,
        assetMeta: { ...assetData.assetMeta, pxDecimals },
        instrumentType: data.instrumentType,
      });
    },
    openSwapModal: (open = true) => set({ swapModalOpen: open }),
  }));
};

export type TradeStore = ReturnType<typeof createTradeStore>;
export const TradeContext = createContext<TradeStore | null>(null);

/** A helper function to get the asset meta and context */
const getTokenMetaAndAssetCtx = (params: {
  dex: string;
  isSpot: boolean;
  assetIndex: number;
  perpDexIndex: number;
}) => {
  const { allDexsAssetCtxs, spotAssetCtxs } = useInstrumentStore.getState();
  const queryClient = getQueryClient();

  const allPerpMetas = queryClient.getQueryData<AllPerpMetasResponse>([
    QUERY_KEYS.allPerpMetas,
  ]);
  const spotMeta = queryClient.getQueryData<SpotMetaResponse>([
    QUERY_KEYS.spotMeta,
  ]);

  if (!allPerpMetas || !spotMeta) return;

  if (params.isSpot) {
    const universe = spotMeta.universe[params.assetIndex];
    const ctx = spotAssetCtxs[universe.index];

    if (!universe || !ctx) return;

    const [baseIndex, quoteIndex] = universe.tokens;

    return {
      assetMeta: mapSpotDataToAssetMeta(
        universe,
        spotMeta.tokens[baseIndex],
        spotMeta.tokens[quoteIndex].name,
      ),
      assetCtx: mapDataToAssetCtx(ctx),
    };
  } else {
    const perpDexState = allPerpMetas[params.perpDexIndex];
    const perpMeta = perpDexState.universe[params.assetIndex];

    const dexCtxState = new Map(allDexsAssetCtxs).get(params.dex);

    if (!perpMeta || !dexCtxState) return;

    const ctx = dexCtxState[params.assetIndex];

    return {
      assetMeta: mapPerpDataToAssetMeta({
        ...parseBuilderDeployedAsset(perpMeta.name),
        universe: perpMeta,
        index: params.assetIndex,
        perpDexIndex: params.perpDexIndex,
        quote: spotMeta.tokens[perpDexState.collateralToken].name,
      }),
      assetCtx: mapDataToAssetCtx(ctx),
    };
  }
};
