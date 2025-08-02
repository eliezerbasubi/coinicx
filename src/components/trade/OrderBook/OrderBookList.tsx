import React, { useCallback, useRef, useState } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList } from "react-window";

import { OrderBookType, PriceLevel } from "@/types/orderbook";
import { useOrderBookStore } from "@/store/trade/orderbook";

import AveragePriceTooltip from "./AveragePriceTooltip";
import OrderBookTableRow from "./OrderBookTableRow";

type Props = {
  side: OrderBookType;
};

const VISIBLE_ROWS = 17;
const MAX_VISIBLE_ROWS = 36;
const ROW_HEIGHT = 20;

const OrderBookList = ({ side }: Props) => {
  const priceLevels = useOrderBookStore((state) => state[side]);

  const layout = useOrderBookStore((state) => state.layout);

  const [hoverIndex, setHoverIndex] = useState(0);
  const scrollHeight = useRef(0);

  // // We use the max amount to get the width of each individual volume bar
  // const maxAmount = Math.max(...orders.map(([_, amount]) => Number(amount)));

  const isOrderbookLayout = layout === "orderBook";
  const containerHeight = !isOrderbookLayout ? 718 : 351;
  const priceLevelsSize = priceLevels.length;

  let itemCount = priceLevelsSize;

  if (isOrderbookLayout || priceLevelsSize <= VISIBLE_ROWS) {
    itemCount = VISIBLE_ROWS;
  } else if (
    priceLevelsSize > VISIBLE_ROWS &&
    priceLevelsSize <= MAX_VISIBLE_ROWS
  ) {
    itemCount = MAX_VISIBLE_ROWS;
  }

  const List = useCallback(
    (props: { width: number; height: number }) => {
      return (
        <>
          <FixedSizeList
            {...props}
            itemData={priceLevels}
            itemCount={itemCount}
            itemSize={ROW_HEIGHT}
            layout="vertical"
            // overscanCount={2}
            className="group/bids"
            onScroll={({ scrollOffset }) => {
              scrollHeight.current = scrollOffset;
            }}
          >
            {Row}
          </FixedSizeList>
          {!!priceLevels.length && (
            <AveragePriceTooltip
              hoveredIndex={hoverIndex}
              rowHeight={ROW_HEIGHT}
              itemCount={itemCount}
              containerHeight={containerHeight}
              type={side}
              data={priceLevels}
              scrollHeight={scrollHeight.current}
            />
          )}
        </>
      );
    },
    [priceLevels, layout, hoverIndex, side],
  );

  const Row = useCallback(
    ({
      data,
      index,
      style,
    }: {
      data: PriceLevel[];
      index: number;
      style: React.CSSProperties;
    }) => {
      if (!data.length) return null;

      const isAsks = side === "asks";
      // Read items in reverse to align them from the lowest to the highest
      const element = isAsks ? data?.[itemCount - 1 - index] : data?.[index];

      // We add fragment to push asks to the bottom when the number of items is less than the visible rows
      if (!element) {
        return <React.Fragment key={index} />;
      }

      const [price, amount] = element;

      // We consider the first item for the highest amount
      const highestAmount = data[0][1];
      const progress = Number(amount) / Number(highestAmount);

      return (
        <OrderBookTableRow
          key={index}
          side={side}
          price={Number(price)}
          amount={Number(amount)}
          progress={progress >= 1 ? 1 : progress}
          style={style}
          onMouseEnter={() => setHoverIndex(index)}
        />
      );
    },
    [itemCount],
  );

  return (
    <div
      className="relative will-change-transform group/orderbook-list"
      style={{ height: containerHeight }}
    >
      <AutoSizer>{List}</AutoSizer>
    </div>
  );
};

export default OrderBookList;
