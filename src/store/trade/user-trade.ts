import { ActiveAssetDataResponse, SpotStateWsEvent } from "@nktkas/hyperliquid";
import { create } from "zustand";

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
}

interface UserTradeStoreActions {
  getOrderAvailableBalance: (args: {
    isBuyOrder: boolean;
    isSpot: boolean;
  }) => number;
  onActiveAssetDataChange: (data: ActiveAssetDataResponse) => void;
  onSpotStateChange: (data: SpotStateWsEvent) => void;
}

interface UserTradeStore extends UserTradeState, UserTradeStoreActions {}

export const useUserTradeStore = create<UserTradeStore>((set, get) => ({
  maxBaseTradeSz: 0,
  maxQuoteTradeSz: 0,
  availableBaseToTrade: 0,
  availableQuoteToTrade: 0,
  leverage: null,
  spotBalances: [],
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
  onActiveAssetDataChange(data) {
    const { maxTradeSzs, availableToTrade, leverage } = data;
    const [maxBaseTradeSz, maxQuoteTradeSz] = maxTradeSzs;
    const [availableBaseToTrade, availableQuoteToTrade] = availableToTrade;

    set({
      maxBaseTradeSz: Number(maxBaseTradeSz),
      maxQuoteTradeSz: Number(maxQuoteTradeSz),
      availableBaseToTrade: Number(availableBaseToTrade),
      availableQuoteToTrade: Number(availableQuoteToTrade),
      leverage,
    });
  },
  onSpotStateChange(data) {
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
}));

export const useMaxTradeSz = (isBuyOrder: boolean) => {
  const maxBaseTradeSz = useUserTradeStore((s) =>
    isBuyOrder ? s.maxQuoteTradeSz : s.maxBaseTradeSz,
  );

  return maxBaseTradeSz;
};

export const useAvailableToTrade = (isBuyOrder: boolean) => {
  const availableBaseToTrade = useUserTradeStore((s) =>
    isBuyOrder ? s.availableQuoteToTrade : s.availableBaseToTrade,
  );
  return availableBaseToTrade;
};
