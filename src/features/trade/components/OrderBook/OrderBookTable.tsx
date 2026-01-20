"use client";

import React from "react";
import { useMediaQuery } from "usehooks-ts";

import { useSubscription } from "@/hooks/useSubscription";
import Visibility from "@/components/common/Visibility";
import { getNSigFigsAndMantissa } from "@/features/trade/utils";
import { hlSubClient } from "@/services/transport";
import { useTradeContext } from "@/store/trade/hooks";
import { useInstrumentStore } from "@/store/trade/instrument";
import { useOrderBookStore } from "@/store/trade/orderbook";
import { cn } from "@/utils/cn";

import OrderBookCompare from "./OrderBookCompare";
import OrderBookList from "./OrderBookList";
import OrderBookTicker from "./OrderBookTicker";

const OrderBookTable = () => {
  const setSnapshot = useOrderBookStore((state) => state.setSnapshot);
  const layout = useOrderBookStore((state) => state.layout);
  const tickSize = useOrderBookStore((state) => state.tickSize);
  const coin = useInstrumentStore((state) => state.assetMeta?.coin);

  const isMobile = useMediaQuery("(max-width: 768px)", {
    initializeWithValue: false,
  });

  useSubscription(() => {
    if (!coin) return;

    const { nSigFigs, mantissa } = getNSigFigsAndMantissa(tickSize);

    return hlSubClient.l2Book({ coin, nSigFigs, mantissa }, (data) => {
      setSnapshot({ bids: data.levels[0], asks: data.levels[1] });
    });
  }, [coin, tickSize]);

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
  const base = useTradeContext((state) => state.base);
  const quote = useTradeContext((state) => state.quote);

  return (
    <div className="flex items-center justify-between text-xs font-medium text-neutral-gray-400 px-4 py-1">
      <div className="flex-1">
        <p>Price ({base})</p>
      </div>
      <div className="flex-1 text-right">
        <p>Amount ({quote})</p>
      </div>
      <div className="flex-1 text-right hidden md:block">
        <p>Total ({quote})</p>
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
