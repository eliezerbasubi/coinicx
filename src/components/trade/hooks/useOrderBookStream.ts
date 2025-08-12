import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { DepthUpdate } from "@/types/orderbook";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useTradeContext } from "@/store/trade/hooks";
import { useOrderBookStore } from "@/store/trade/orderbook";

import { createBatchedDiffApplier } from "../utils/batchDiffApplier";

export const useOrderBookStream = () => {
  const websocket = useRef<WebSocket>(undefined);
  const queryClient = useQueryClient();
  const applyDiff = useOrderBookStore((s) => s.applyDiff);

  const symbol = useTradeContext((s) => s.symbol);

  // Create a debounced batched diff applier
  const batchedApplyDiff = createBatchedDiffApplier(applyDiff);

  useEffect(() => {
    if (websocket.current) return;

    websocket.current = new WebSocket(
      `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@depth`,
    );

    websocket.current.onmessage = (event) => {
      const eventData: DepthUpdate = JSON.parse(event.data);

      batchedApplyDiff(eventData, () => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.orderbook, symbol],
        });
      });
    };

    return () => {
      websocket.current?.close();
    };
  }, [symbol]);
};
