import {
  ActiveAssetDataResponse,
  AllDexsClearinghouseStateWsEvent,
  OpenOrdersWsEvent,
  SpotStateWsEvent,
  TwapStatesWsEvent,
  UserFillsWsEvent,
  UserFundingsWsEvent,
  UserHistoricalOrdersWsEvent,
  UserNonFundingLedgerUpdatesWsEvent,
  UserTwapHistoryWsEvent,
  UserTwapSliceFillsWsEvent,
  WebData3WsEvent,
} from "@nktkas/hyperliquid";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

import { AllDexsClearinghouseState, SpotBalance } from "@/lib/types/trade";

type TwapStates = {
  twaps: TwapStatesWsEvent["states"];
  history: UserTwapHistoryWsEvent["history"];
  sliceFills: UserTwapSliceFillsWsEvent["twapSliceFills"];
};

// User events that don't need any mutations inside the store
type UserEventState = {
  webData: WebData3WsEvent | null;
  openOrders: OpenOrdersWsEvent["orders"];
  historicalOrders: UserHistoricalOrdersWsEvent["orderHistory"];
  fills: UserFillsWsEvent["fills"];
  fundings: UserFundingsWsEvent["fundings"];
  nonFundingLedger: UserNonFundingLedgerUpdatesWsEvent["nonFundingLedgerUpdates"];
};

type UserTradeState = {
  /** User perps data for the active asset */
  activeAssetData: ActiveAssetDataResponse | null;
  spotBalances: SpotBalance[];
  twapStates: TwapStates;
  clearinghouseStates: Map<string, AllDexsClearinghouseState>;
  allDexsClearinghouseState: AllDexsClearinghouseState | null;
} & UserEventState;

type UserTradeStoreActions = {
  updateLeverage: (
    leverage: Partial<Omit<ActiveAssetDataResponse["leverage"], "rawUsd">>,
  ) => void;
  getOrderAvailableBalance: (args: {
    isBuyOrder: boolean;
    isSpot: boolean;
    spotAsset?: { base: string; quote: string };
  }) => number;
  applyActiveAssetData: (data: ActiveAssetDataResponse) => void;
  applySpotState: (data: SpotStateWsEvent) => void;
  applyClearinghouseState: (data: AllDexsClearinghouseStateWsEvent) => void;
  applyUserEventStates: (
    data: Partial<UserEventState> & Partial<TwapStates>,
  ) => void;
  reset: () => void;
};

interface UserTradeStore extends UserTradeState, UserTradeStoreActions {}

const initialState: UserTradeState = {
  activeAssetData: null,
  spotBalances: [],
  webData: null,
  openOrders: [],
  fills: [],
  fundings: [],
  nonFundingLedger: [],
  historicalOrders: [],
  twapStates: {
    twaps: [],
    history: [],
    sliceFills: [],
  },
  clearinghouseStates: new Map(),
  allDexsClearinghouseState: null,
};

export const useUserTradeStore = create<UserTradeStore>((set, get) => ({
  ...initialState,
  updateLeverage(leverage) {
    const { activeAssetData } = get();

    if (!activeAssetData) throw new Error("No active asset data to update");

    set({
      activeAssetData: {
        ...activeAssetData,
        leverage: {
          ...activeAssetData.leverage,
          ...leverage,
        } as ActiveAssetDataResponse["leverage"],
      },
    });
  },
  getOrderAvailableBalance(params) {
    const { spotBalances, activeAssetData } = get();

    return getAvailableToTrade({
      isBuyOrder: params.isBuyOrder,
      spotBalances,
      perpsAvailableToTrade: activeAssetData?.availableToTrade ?? ["0", "0"],
      spotAsset: params.spotAsset,
    });
  },
  applyActiveAssetData(data) {
    set({
      activeAssetData: data,
    });
  },
  applySpotState(data) {
    set({
      spotBalances: data.spotState.balances,
    });
  },
  applyClearinghouseState(data) {
    const clearinghouseStates = new Map(data.clearinghouseStates);

    const allDexsClearinghouseState = aggregateClearinghouseStates(
      Array.from(clearinghouseStates.values()),
    );

    set({
      clearinghouseStates,
      allDexsClearinghouseState,
    });
  },
  applyUserEventStates(data) {
    set((state) => ({
      ...state,
      ...data,
      twapStates: { ...state.twapStates, ...data },
    }));
  },
  reset: () => set(initialState),
}));

export const useShallowUserTradeStore = <T>(
  selector: (state: UserTradeStore) => T,
) => {
  return useUserTradeStore(useShallow(selector));
};

export const useMaxTradeSz = (isBuyOrder: boolean) => {
  const maxTradeSizes = useShallowUserTradeStore(
    (s) => s.activeAssetData?.maxTradeSzs,
  );

  const [maxBaseTradeSz, maxQuoteTradeSz] = maxTradeSizes ?? ["0", "0"];

  return isBuyOrder ? Number(maxQuoteTradeSz) : Number(maxBaseTradeSz);
};

/**
 * A hook to get the available balance to trade on an asset.
 *
 * If the asset is a perp, it will return the available balance for the active asset.
 * If the asset is a spot, it will return the available balance for the spot asset.
 *
 * @param isBuyOrder Whether the order is a buy order
 * @param spotAsset Optional spot asset to get the available balance for
 * @returns quote balance if isSpot and buying and base balance for perps if buying
 */
export const useAvailableToTrade = (params: {
  isBuyOrder: boolean;
  spotAsset?: { base: string; quote: string };
}) => {
  const { activeAssetData, spotBalances } = useShallowUserTradeStore((s) => ({
    activeAssetData: s.activeAssetData?.availableToTrade,
    spotBalances: s.spotBalances,
  }));

  return getAvailableToTrade({
    isBuyOrder: params.isBuyOrder,
    spotBalances,
    perpsAvailableToTrade: activeAssetData ?? ["0", "0"],
    spotAsset: params.spotAsset,
  });
};

const getAvailableToTrade = (params: {
  isBuyOrder: boolean;
  spotBalances: SpotBalance[];
  perpsAvailableToTrade: string[];
  spotAsset?: { base: string; quote: string };
}) => {
  if (params.spotAsset) {
    let baseBalance: number | null = null;
    let quoteBalance: number | null = null;

    for (const balance of params.spotBalances) {
      if (balance.coin === params.spotAsset.base) {
        baseBalance = Number(balance.total);
      }
      if (balance.coin === params.spotAsset.quote) {
        quoteBalance = Number(balance.total);
      }

      if (baseBalance !== null && quoteBalance !== null) break;
    }

    return params.isBuyOrder ? (quoteBalance ?? 0) : (baseBalance ?? 0);
  }

  const [availableBaseToTrade, availableQuoteToTrade] =
    params.perpsAvailableToTrade ?? ["0", "0"];

  return params.isBuyOrder
    ? Number(availableBaseToTrade)
    : Number(availableQuoteToTrade);
};

/**
 * Aggregates clearinghouse states from all DEXs.
 * @param data Array of clearinghouse states from all DEXs.
 * @returns Aggregated clearinghouse state.
 */
const aggregateClearinghouseStates = (data: AllDexsClearinghouseState[]) => {
  const initialClearinghouseState: AllDexsClearinghouseState = {
    assetPositions: [],
    crossMaintenanceMarginUsed: "0.0",
    time: 0,
    withdrawable: "0.0",
    crossMarginSummary: {
      accountValue: "0.0",
      totalMarginUsed: "0.0",
      totalNtlPos: "0.0",
      totalRawUsd: "0.0",
    },
    marginSummary: {
      accountValue: "0.0",
      totalMarginUsed: "0.0",
      totalNtlPos: "0.0",
      totalRawUsd: "0.0",
    },
  };

  const crossMarginSummaryKeys = Object.keys(
    initialClearinghouseState.crossMarginSummary,
  ) as Array<keyof typeof initialClearinghouseState.crossMarginSummary>;

  const marginSummaryKeys = Object.keys(
    initialClearinghouseState.marginSummary,
  ) as Array<keyof typeof initialClearinghouseState.marginSummary>;

  const aggregated = data.reduce((acc, clearinghouseState) => {
    if (clearinghouseState.assetPositions?.length) {
      acc.assetPositions.push(...clearinghouseState.assetPositions);
    }

    acc.time = clearinghouseState.time;

    acc.withdrawable = (
      Number(acc.withdrawable) + Number(clearinghouseState.withdrawable ?? 0)
    ).toString();

    acc.crossMaintenanceMarginUsed = (
      Number(acc.crossMaintenanceMarginUsed) +
      Number(clearinghouseState.crossMaintenanceMarginUsed ?? 0)
    ).toString();

    for (const key of crossMarginSummaryKeys) {
      acc.crossMarginSummary[key] = (
        Number(acc.crossMarginSummary[key]) +
        Number(clearinghouseState.crossMarginSummary?.[key] ?? 0)
      ).toString();
    }

    for (const key of marginSummaryKeys) {
      acc.marginSummary[key] = (
        Number(acc.marginSummary[key]) +
        Number(clearinghouseState.marginSummary?.[key] ?? 0)
      ).toString();
    }

    return acc;
  }, initialClearinghouseState);

  return aggregated;
};
