"use client";

import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUp } from "lucide-react";

import { QUERY_KEYS } from "@/constants/queryKeys";
import { getOrderBookDepth } from "@/services/trade";
import { useSpotTradeContext } from "@/store/trade/hooks";
import { useOrderBookStore } from "@/store/trade/orderbook";
import { formatNumber } from "@/utils/formatting/numbers";

import { useStream } from "../hooks";
import OrderBookCompare from "./OrderBookCompare";
import OrderBookList from "./OrderBookList";

const OrderBookTable = () => {
  const setSnapshot = useOrderBookStore((state) => state.setSnapshot);
  const layout = useOrderBookStore((state) => state.layout);
  const symbol = useSpotTradeContext((state) => state.symbol);
  const baseAsset = useSpotTradeContext((state) => state.baseAsset);
  const quoteAsset = useSpotTradeContext((state) => state.quoteAsset);

  const { data } = useQuery({
    queryKey: [QUERY_KEYS.orderbook, symbol],
    staleTime: Infinity,
    queryFn: () => getOrderBookDepth({ symbol: symbol }),
  });

  useStream();

  useEffect(() => {
    if (data) {
      setSnapshot(data);
    }
  }, [data]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs font-medium text-neutral-gray-400 px-4 py-1">
        <div className="flex-1">
          <p>Price ({quoteAsset})</p>
        </div>
        <div className="flex-1 text-right">
          <p>Amount ({baseAsset})</p>
        </div>
        <div className="flex-1 text-right">
          <p>Total ({baseAsset})</p>
        </div>
      </div>

      <div className="w-full">
        {layout !== "buyOrder" && <OrderBookList side="asks" />}

        <div className="w-full flex items-center py-3 px-4">
          <p className="text-xl text-buy font-bold">
            {formatNumber(117485.55, { maximumFractionDigits: 2 })}
          </p>
          <ArrowUp key="arrow" className="text-buy size-5 rotate-180" />
          <p className="text-sm text-neutral-gray-400 ml-2">
            {formatNumber(117485.55, {
              style: "currency",
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        {layout !== "sellOrder" && <OrderBookList side="bids" />}
      </div>

      {layout === "orderBook" && <OrderBookCompare />}
    </div>
  );
};

export default OrderBookTable;
