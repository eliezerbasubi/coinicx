import { hlSubClient } from "@/lib/services/transport";
import { useShallowOrderFormStore } from "@/lib/store/trade/order-form";
import {
  useOrderBookStore,
  useShallowOrderBookStore,
} from "@/lib/store/trade/orderbook";
import { useShallowUserTradeStore } from "@/lib/store/trade/user-trade";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import { useSubscription } from "@/hooks/useSubscription";
import { useMarketEventContext } from "@/features/predict/lib/store/market-event/hooks";
import { MarketEventMetaSide } from "@/features/predict/lib/types";
import { parseSideCoinFromCoin } from "@/features/predict/lib/utils/outcomes";

import MarketEventOrderBookList from "./MarketEventOrderbookList";

type Props = {
  outcomeCoin: string;
  outcomeSides: MarketEventMetaSide[];
};

const ORDERBOOK_COLUMNS = ["Price", "Shares", "Total"];

const MarketEventOrderbook = ({ outcomeSides, outcomeCoin }: Props) => {
  const predictSideIndex = useShallowOrderFormStore((s) => s.predictSideIndex);

  const { bids, asks } = useShallowOrderBookStore((s) => ({
    bids: s.bids,
    asks: s.asks,
  }));

  const openOrder = useShallowUserTradeStore((s) => {
    const order = s.openOrders.find((order) => order.coin === outcomeCoin);

    let openOrder = null;

    if (order) {
      const parsedData = parseSideCoinFromCoin(order.coin);

      if (parsedData) {
        openOrder = {
          sideIndex: parsedData.sideIndex,
          shares: Number(order.sz),
          avgEntryPx: Number(order.limitPx || order.triggerPx),
        };
      }
    }

    return openOrder;
  });

  const currentSide = outcomeSides[predictSideIndex];
  const coin = currentSide.coin;

  // Subscribe to order book l2Book state
  useSubscription(() => {
    if (!coin) return;

    return hlSubClient.l2Book({ coin }, (data) => {
      useOrderBookStore
        .getState()
        .setSnapshot({ bids: data.levels[0], asks: data.levels[1] });
    });
  }, [coin]);

  return (
    <div className="w-full max-h-90 overflow-y-auto no-scrollbars">
      <div className="grid grid-cols-[40%_20%_20%_20%] items-center border-b border-neutral-gray-200 h-9 sticky top-0 z-10 bg-primary-dark">
        <div className="h-full flex items-center px-2">
          <p className="text-xs font-medium text-neutral-gray-400 uppercase">
            Trade {currentSide.name}
          </p>
        </div>
        {ORDERBOOK_COLUMNS.map((label) => (
          <div
            key={label}
            className="h-full flex items-center justify-center px-2"
          >
            <p className="text-xs font-medium text-neutral-gray-400 uppercase">
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="w-full">
        <MarketEventOrderBookList
          items={asks}
          type="asks"
          openOrder={
            openOrder?.sideIndex === 1
              ? { shares: openOrder?.shares, avgEntryPx: openOrder?.avgEntryPx }
              : undefined
          }
        />

        <OrderBookTicker />

        <MarketEventOrderBookList
          items={bids}
          type="bids"
          openOrder={
            openOrder?.sideIndex === 0
              ? { shares: openOrder?.shares, avgEntryPx: openOrder?.avgEntryPx }
              : undefined
          }
        />
      </div>
    </div>
  );
};

const OrderBookTicker = () => {
  const predictSideIndex = useShallowOrderFormStore((s) => s.predictSideIndex);

  const sideCtx = useMarketEventContext(
    (s) =>
      s.marketEventCtx.outcomes[s.activeOutcomeIndex]?.sides?.[
        predictSideIndex
      ] ?? s.marketEventCtx.sides[predictSideIndex],
  );

  const lastPrice = sideCtx?.midPx || sideCtx.markPx;

  return (
    <div className="w-full h-9 flex items-center justify-center sticky bottom-0 top-9 z-10 bg-primary-dark border-y border-neutral-gray-200">
      <p className="text-sm font-medium text-neutral-gray-400">
        <span>Last:</span>
        <span className="ml-1">
          {formatNumber(lastPrice, {
            style: "cent",
            maximumFractionDigits: 1,
          })}
        </span>
      </p>
    </div>
  );
};

export default MarketEventOrderbook;
