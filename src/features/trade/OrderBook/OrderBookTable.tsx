"use client";

import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMediaQuery } from "usehooks-ts";

import Visibility from "@/components/common/Visibility";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { getOrderBookDepth } from "@/services/trade";
import { useTradeContext } from "@/store/trade/hooks";
import { useOrderBookStore } from "@/store/trade/orderbook";
import { cn } from "@/utils/cn";

import { useOrderBookStream } from "../hooks";
import OrderBookCompare from "./OrderBookCompare";
import OrderBookList from "./OrderBookList";
import OrderBookTicker from "./OrderBookTicker";

const OrderBookTable = () => {
  const setSnapshot = useOrderBookStore((state) => state.setSnapshot);
  const layout = useOrderBookStore((state) => state.layout);
  const symbol = useTradeContext((state) => state.symbol);

  const isMobile = useMediaQuery("(max-width: 768px)", {
    initializeWithValue: false,
  });

  const { data } = useQuery({
    queryKey: [QUERY_KEYS.orderbook, symbol],
    staleTime: Infinity,
    queryFn: () => getOrderBookDepth({ symbol: symbol }),
  });

  useOrderBookStream();

  useEffect(() => {
    if (data) {
      setSnapshot(data);
    }
  }, [data]);

  return (
    <div className="w-full">
      <Visibility visible={isMobile} fallback={<OrderBookTableHeader />}>
        <div className="grid grid-cols-2 gap-2 px-4">
          <OrderBookTableHeaderMobile />
          <OrderBookTableHeaderMobile />
        </div>
      </Visibility>

      <div className="w-full grid grid-cols-2 gap-2 md:block px-4 md:px-0">
        {layout !== "buyOrder" && (
          <OrderBookList side="asks" className={cn({ "p-0": isMobile })} />
        )}

        {!isMobile && <OrderBookTicker />}

        {layout !== "sellOrder" && (
          <OrderBookList side="bids" className={cn({ "p-0": isMobile })} />
        )}
      </div>

      {layout === "orderBook" && <OrderBookCompare />}
    </div>
  );
};

const OrderBookTableHeader = () => {
  const baseAsset = useTradeContext((state) => state.baseAsset);
  const quoteAsset = useTradeContext((state) => state.quoteAsset);

  return (
    <div className="flex items-center justify-between text-xs font-medium text-neutral-gray-400 px-4 py-1">
      <div className="flex-1">
        <p>Price ({quoteAsset})</p>
      </div>
      <div className="flex-1 text-right">
        <p>Amount ({baseAsset})</p>
      </div>
      <div className="flex-1 text-right hidden md:block">
        <p>Total ({baseAsset})</p>
      </div>
    </div>
  );
};

const OrderBookTableHeaderMobile = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between text-xs font-medium text-neutral-gray-400 py-1",
        className,
      )}
    >
      <div className="flex-1">
        <p>Price </p>
      </div>
      <div className="flex-1 text-right">
        <p>Amount </p>
      </div>
    </div>
  );
};

export default OrderBookTable;
