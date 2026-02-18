import {
  ActiveAssetDataResponse,
  AllDexsClearinghouseStateWsEvent,
  SpotStateWsEvent,
  WebData3WsEvent,
} from "@nktkas/hyperliquid";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

import { useInstrumentStore } from "./instrument";

type SpotBalances = SpotStateWsEvent["spotState"]["balances"];

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
  spotBalances: SpotBalances;
  webData: WebData3WsEvent | null;
  clearinghouseState:
    | AllDexsClearinghouseStateWsEvent["clearinghouseStates"][number][1]
    | null;
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
  applyClearinghouseState: (data: AllDexsClearinghouseStateWsEvent) => void;
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
  clearinghouseState: null,
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
      return args.isBuyOrder ? availableQuoteToTrade : availableBaseToTrade;
    }
    return args.isBuyOrder ? maxQuoteTradeSz : maxBaseTradeSz;
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

    if (assetMeta) {
      data.spotState.balances.forEach((balance) => {
        if (balance.coin === assetMeta.base) {
          availableBaseToTrade = Number(balance.total);
        }
        if (balance.coin === assetMeta.quote) {
          availableQuoteToTrade = Number(balance.total);
        }
      });
    }

    set({
      availableBaseToTrade,
      availableQuoteToTrade,
      spotBalances: data.spotState.balances,
    });
  },
  applyWebData(data) {
    set({
      webData: data,
    });
  },
  applyClearinghouseState(data) {
    const assetMeta = useInstrumentStore.getState().assetMeta;

    if (!assetMeta || assetMeta.dex === null) return;

    const clearinghouseState = new Map(data.clearinghouseStates).get(
      assetMeta.dex,
    );

    if (!clearinghouseState) return;

    set({ clearinghouseState });
  },
}));

export const useShallowUserTradeStore = <T>(
  selector: (state: UserTradeStore) => T,
) => {
  return useUserTradeStore(useShallow(selector));
};

export const useMaxTradeSz = (isBuyOrder: boolean) => {
  const maxBaseTradeSz = useShallowUserTradeStore((s) =>
    isBuyOrder ? s.maxQuoteTradeSz : s.maxBaseTradeSz,
  );

  return maxBaseTradeSz;
};

export const useAvailableToTrade = (isBuyOrder: boolean) => {
  const availableBaseToTrade = useShallowUserTradeStore((s) =>
    isBuyOrder ? s.availableQuoteToTrade : s.availableBaseToTrade,
  );
  return availableBaseToTrade;
};
