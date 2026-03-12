"use client";

import { useMediaQuery } from "usehooks-ts";

import { OrderBookDisplayOrientation } from "@/types/orderbook";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useSubscription } from "@/hooks/useSubscription";
import Visibility from "@/components/common/Visibility";
import { getNSigFigsAndMantissa } from "@/features/trade/utils";
import { hlSubClient } from "@/services/transport";
import { useTradeContext } from "@/store/trade/hooks";
import { useShallowInstrumentStore } from "@/store/trade/instrument";
import {
  useOrderBookStore,
  useShallowOrderBookStore,
} from "@/store/trade/orderbook";
import { cn } from "@/utils/cn";

import OrderBookCompare from "./OrderBookCompare";
import OrderBookList from "./OrderBookList";
import OrderBookTicker from "./OrderBookTicker";

type Props = {
  orientation?: OrderBookDisplayOrientation;
};

const OrderBookTable = ({ orientation }: Props) => {
  const { layout, tickSize } = useShallowOrderBookStore((state) => ({
    layout: state.layout,
    tickSize: state.tickSize,
  }));
  const coin = useShallowInstrumentStore((state) => state.assetMeta?.coin);

  const isMobile = useIsMobile();
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1023px)"); // Exclude laptop breakpoint(1024px)

  useSubscription(() => {
    if (!coin) return;

    const { nSigFigs, mantissa } = getNSigFigsAndMantissa(tickSize);

    return hlSubClient.l2Book({ coin, nSigFigs, mantissa }, (data) => {
      useOrderBookStore
        .getState()
        .setSnapshot({ bids: data.levels[0], asks: data.levels[1] });
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

      <div className="w-full grid grid-cols-2 gap-2 md:block px-4 md:px-0 md:h-40 lg:h-auto">
        <Visibility visible={layout !== "buyOrder"}>
          <OrderBookList side="asks" orientation={orientation} />
        </Visibility>

        <Visibility visible={!isMobile}>
          <OrderBookTicker />
        </Visibility>

        <Visibility visible={layout !== "sellOrder"}>
          <OrderBookList side="bids" className="group/bid" />
        </Visibility>
      </div>
      <Visibility visible={layout === "orderBook" && !isTablet}>
        <OrderBookCompare />
      </Visibility>
    </div>
  );
};

const OrderBookTableHeader = () => {
  const { base, quote } = useTradeContext((state) => ({
    base: state.base,
    quote: state.quote,
  }));

  return (
    <div className="flex items-center justify-between text-xs font-medium text-neutral-gray-400 px-4 py-1">
      <div className="flex-1">
        <p>Price ({quote})</p>
      </div>
      <div className="flex-1 text-right">
        <p>Amount ({base})</p>
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
