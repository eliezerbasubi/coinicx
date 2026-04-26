/**
 *
 * This store should only be responsible for storing the user's prediction balances
 *
 * - open orders (filtered)
 * - user positions (filtered)
 * - balances (filtered)
 * - fills
 *
 * This is to avoid cluttering the user trade store with prediction-specific data
 */

import {
  FrontendOpenOrdersResponse,
  OpenOrdersWsEvent,
  SpotStateWsEvent,
} from "@nktkas/hyperliquid";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

import { SpotBalance } from "@/lib/types/trade";

import { isOutcomeCoin, parseSideCoinFromCoin } from "../utils/outcomes";

interface UserPredictionState {
  /** Mapping of outcome id to its spot balances */
  predictionBalances: Map<number, SpotBalance[]>;
  /** Mapping of outcome id to its open orders */
  openOrders: Map<number, FrontendOpenOrdersResponse>;
  applyPredictionBalances: (data: SpotStateWsEvent) => void;
  applyOpenOrders: (data: OpenOrdersWsEvent) => void;
}

export const useUserPredictionStore = create<UserPredictionState>((set) => ({
  predictionBalances: new Map(),
  openOrders: new Map(),

  applyPredictionBalances: (data) => {
    const predictionBalances = new Map<number, SpotBalance[]>();

    for (const balance of data.spotState.balances) {
      if (isOutcomeCoin(balance.coin) && Number(balance.total) > 0) {
        const parseCoin = parseSideCoinFromCoin(balance.coin);

        if (!parseCoin) continue;

        const currentBalance = predictionBalances.get(parseCoin.outcomeId);

        if (!currentBalance) {
          predictionBalances.set(parseCoin.outcomeId, [balance]);
        } else {
          currentBalance.push(balance);
          predictionBalances.set(parseCoin.outcomeId, currentBalance);
        }
      }
    }

    set({ predictionBalances });
  },

  applyOpenOrders: (data) => {
    const openOrders = new Map<number, FrontendOpenOrdersResponse>();

    for (const order of data.orders) {
      if (isOutcomeCoin(order.coin)) {
        const parseCoin = parseSideCoinFromCoin(order.coin);

        if (!parseCoin) continue;

        if (!openOrders.has(parseCoin.outcomeId)) {
          openOrders.set(parseCoin.outcomeId, [order]);
        } else {
          openOrders.get(parseCoin.outcomeId)?.push(order);
        }
      }
    }

    set({ openOrders });
  },
}));

export const useShallowUserPredictionStore = <T>(
  selector: (state: UserPredictionState) => T,
) => {
  return useUserPredictionStore(useShallow(selector));
};
