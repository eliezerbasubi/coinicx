import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { DepthUpdate } from "@/types/orderbook";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useOrderBookStore } from "@/store/trade/orderbook";

import { createBatchedDiffApplier } from "../utils/batchDiffApplier";

export const useStream = () => {
  const websocket = useRef<WebSocket>(undefined);
  const queryClient = useQueryClient();
  const applyDiff = useOrderBookStore((state) => state.applyDiff);

  // Create a debounced batched diff applier
  const batchedApplyDiff = createBatchedDiffApplier(applyDiff);

  useEffect(() => {
    websocket.current = new WebSocket(
      "wss://stream.binance.com:9443/ws/btcusdt@depth",
    );

    websocket.current.onmessage = (event) => {
      const eventData: DepthUpdate = JSON.parse(event.data);

      batchedApplyDiff(eventData, () => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.orderbook, "BTCUSDT"],
        });
      });
    };

    return () => {
      websocket.current?.close();
    };
  }, []);
};
