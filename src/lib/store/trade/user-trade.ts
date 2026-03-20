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

import { useInstrumentStore } from "./instrument";

type TwapStates = {
  twaps: TwapStatesWsEvent["states"];
  history: UserTwapHistoryWsEvent["history"];
  sliceFills: UserTwapSliceFillsWsEvent["twapSliceFills"];
};

interface UserTradeState {
  /** Max size in base asset. e.g. BTC for perps */
  maxBaseTradeSz: number;
  /** Max size in quote asset. e.g. BTC for perps */
  maxQuoteTradeSz: number;
  /** Available to trade in base asset. e.g. BTC for perps and HYPE for spot */
  availableBaseToTrade: number;
  /** Available to trade in quote asset. e.g. BTC for perps and notional for spot */
  availableQuoteToTrade: number;
  leverage: ActiveAssetDataResponse["leverage"] | null;
  spotBalances: SpotBalance[];
  openOrders: OpenOrdersWsEvent["orders"];
  historicalOrders: UserHistoricalOrdersWsEvent["orderHistory"];
  fills: UserFillsWsEvent["fills"];
  fundings: UserFundingsWsEvent["fundings"];
  nonFundingLedger: UserNonFundingLedgerUpdatesWsEvent["nonFundingLedgerUpdates"];
  twapStates: TwapStates;
  webData: WebData3WsEvent | null;
  clearinghouseState: AllDexsClearinghouseState | null;
  allDexsClearinghouseState: AllDexsClearinghouseState | null;
}

interface UserTradeStoreActions {
  updateLeverage: (
    leverage: Partial<Omit<ActiveAssetDataResponse["leverage"], "rawUsd">>,
  ) => void;
  getOrderAvailableBalance: (args: {
    isBuyOrder: boolean;
    isSpot: boolean;
  }) => number;
  applyActiveAssetData: (data: ActiveAssetDataResponse) => void;
  applySpotState: (data: SpotStateWsEvent) => void;
  applyWebData: (data: WebData3WsEvent) => void;
  applyOpenOrders: (data: OpenOrdersWsEvent) => void;
  applyClearinghouseState: (data: AllDexsClearinghouseStateWsEvent) => void;
  applyUserFills: (data: UserFillsWsEvent) => void;
  applyTwapStates: (data: Partial<TwapStates>) => void;
  applyUserHistoricalOrders: (data: UserHistoricalOrdersWsEvent) => void;
  applyUserFundings: (data: UserFundingsWsEvent) => void;
  applyUserNonFundingLedgerUpdates: (
    data: UserNonFundingLedgerUpdatesWsEvent,
  ) => void;
}

interface UserTradeStore extends UserTradeState, UserTradeStoreActions {}

export const useUserTradeStore = create<UserTradeStore>((set, get) => ({
  maxBaseTradeSz: 0,
  maxQuoteTradeSz: 0,
  availableBaseToTrade: 0,
  availableQuoteToTrade: 0,
  leverage: null,
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
  clearinghouseState: null,
  allDexsClearinghouseState: null,
  updateLeverage(leverage) {
    const { leverage: currentLeverage } = get();

    if (!currentLeverage) throw new Error("No leverage data to update");

    set({
      leverage: {
        ...currentLeverage,
        ...leverage,
      } as ActiveAssetDataResponse["leverage"],
    });
  },
  getOrderAvailableBalance(args) {
    const {
      maxBaseTradeSz,
      maxQuoteTradeSz,
      availableBaseToTrade,
      availableQuoteToTrade,
    } = get();

    if (args.isSpot) {
      return args.isBuyOrder ? availableBaseToTrade : availableQuoteToTrade;
    }
    return args.isBuyOrder ? maxBaseTradeSz : maxQuoteTradeSz;
  },
  applyActiveAssetData(data) {
    const { leverage } = get();

    const { maxTradeSzs, availableToTrade, leverage: newLeverage } = data;
    const [maxBaseTradeSz, maxQuoteTradeSz] = maxTradeSzs;
    const [availableBaseToTrade, availableQuoteToTrade] = availableToTrade;

    set({
      maxBaseTradeSz: Number(maxBaseTradeSz),
      maxQuoteTradeSz: Number(maxQuoteTradeSz),
      availableBaseToTrade: Number(availableBaseToTrade),
      availableQuoteToTrade: Number(availableQuoteToTrade),

      // We preserve the existing leverage state when updating leverage data from active asset data, since the data may take a few seconds to reflect the changes.
      leverage: { ...newLeverage, ...leverage },
    });
  },
  applySpotState(data) {
    const assetMeta = useInstrumentStore.getState().assetMeta;

    let availableBaseToTrade = 0;
    let availableQuoteToTrade = 0;

    if (assetMeta && assetMeta.dex === null) {
      data.spotState.balances.forEach((balance) => {
        if (balance.coin === assetMeta.base) {
          availableBaseToTrade = Number(balance.total);
        }
        if (balance.coin === assetMeta.quote) {
          availableQuoteToTrade = Number(balance.total);
        }
      });

      set({
        availableBaseToTrade,
        availableQuoteToTrade,
      });
    }

    set({
      spotBalances: data.spotState.balances,
    });
  },
  applyWebData(data) {
    set({
      webData: data,
    });
  },
  applyOpenOrders(data) {
    set({
      openOrders: data.orders,
    });
  },
  applyUserFills(data) {
    set({
      fills: data.fills,
    });
  },
  applyTwapStates(data) {
    const { twapStates } = get();

    set({
      twapStates: { ...twapStates, ...data },
    });
  },
  applyUserHistoricalOrders(data) {
    set({
      historicalOrders: data.orderHistory,
    });
  },
  applyUserFundings(data) {
    set({
      fundings: data.fundings,
    });
  },
  applyClearinghouseState(data) {
    const assetMeta = useInstrumentStore.getState().assetMeta;

    const clearinghouseStates = new Map(data.clearinghouseStates);

    let clearinghouseState = null;

    if (assetMeta && assetMeta.dex !== null) {
      clearinghouseState = clearinghouseStates.get(assetMeta.dex);
    }

    const allDexsClearinghouseState = aggregateClearinghouseStates(
      Array.from(clearinghouseStates.values()),
    );

    set({
      clearinghouseState,
      allDexsClearinghouseState,
    });
  },
  applyUserNonFundingLedgerUpdates(data) {
    set({ nonFundingLedger: data.nonFundingLedgerUpdates });
  },
}));

export const useShallowUserTradeStore = <T>(
  selector: (state: UserTradeStore) => T,
) => {
  return useUserTradeStore(useShallow(selector));
};

export const useMaxTradeSz = (isBuyOrder: boolean) => {
  const maxTradeSize = useShallowUserTradeStore((s) =>
    isBuyOrder ? s.maxQuoteTradeSz : s.maxBaseTradeSz,
  );

  return maxTradeSize;
};

/**
 * A hook to get the available balance to trade on an asset.
 *
 * @param isBuyOrder
 * @param isSpot
 * @returns quote balance if isSpot and buying and base balance for perps if buying
 */
export const useAvailableToTrade = (isBuyOrder: boolean, isSpot: boolean) => {
  const { availableBaseToTrade, availableQuoteToTrade } =
    useShallowUserTradeStore((s) => ({
      availableBaseToTrade: s.availableBaseToTrade,
      availableQuoteToTrade: s.availableQuoteToTrade,
    }));

  if (isSpot) {
    return isBuyOrder ? availableQuoteToTrade : availableBaseToTrade;
  }

  return isBuyOrder ? availableBaseToTrade : availableQuoteToTrade;
};

/**
 * Aggregates clearinghouse states from all DEXs.
 * @param data Array of clearinghouse states from all DEXs.
 * @returns Aggregated clearinghouse state.
 */
export const aggregateClearinghouseStates = (
  data: AllDexsClearinghouseState[],
) => {
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
