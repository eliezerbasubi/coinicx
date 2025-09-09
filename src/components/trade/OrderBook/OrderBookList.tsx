import React, { useCallback, useRef, useState } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList } from "react-window";
import { useMediaQuery } from "usehooks-ts";

import { OrderBookType, PriceLevel } from "@/types/orderbook";
import { useOrderBookStore } from "@/store/trade/orderbook";
import { cn } from "@/utils/cn";

import AveragePriceTooltip from "./AveragePriceTooltip";
import OrderBookTableRow from "./OrderBookTableRow";

type Props = {
  side: OrderBookType;
  className?: string;
};

const VISIBLE_ROWS = 10;
const MAX_VISIBLE_ROWS = 17;
const ROW_HEIGHT = 20;

const OrderBookList = ({ side, className }: Props) => {
  const priceLevels = useOrderBookStore((state) => state[side]);

  const layout = useOrderBookStore((state) => state.layout);
  const averageAndSum = useOrderBookStore(
    (state) => state.settings.averageAndSum,
  );
  const depthVisualizer = useOrderBookStore(
    (state) => state.settings.depthVisualizer,
  );

  const isMobile = useMediaQuery("(max-width: 768px)", {
    initializeWithValue: false,
  });

  const [hoverIndex, setHoverIndex] = useState(0);
  const scrollHeight = useRef(0);

  const isOrderbookLayout = layout === "orderBook";
  let containerHeight = !isOrderbookLayout ? 420 : 200;
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

  if (isMobile) {
    itemCount = 22;
    containerHeight = 440;
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
            onScroll={({ scrollOffset }) => {
              scrollHeight.current = scrollOffset;
            }}
          >
            {Row}
          </FixedSizeList>
          {!!priceLevels.length && averageAndSum && (
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
    [priceLevels, layout, hoverIndex, averageAndSum, side],
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
      if (!data?.length) return null;

      // For Asks, Read items in reverse to align them from the lowest to the highest
      const element =
        side === "asks" ? data[itemCount - 1 - index] : data[index];

      // We add fragment to push asks to the bottom when the number of items is less than the visible rows
      // React-window will consider these fragments as items but they won't be rendered as elements on the DOM
      if (!element) {
        return <React.Fragment key={index} />;
      }

      const [price, amount] = element;

      let progress = 0;

      if (depthVisualizer === "cumulative") {
        const maxCumAmount = data[data.length - 1][2];
        const cumAmount = element[2];

        if (maxCumAmount && cumAmount) {
          progress = cumAmount / maxCumAmount;
        }
      } else {
        // We consider the first item for the highest amount
        const highestAmount = data[0][1];
        progress = Number(amount) / Number(highestAmount);
      }

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
    [itemCount, depthVisualizer, side],
  );

  return (
    <div
      className={cn(
        "relative z-10 will-change-transform group/orderbook-list",
        className,
      )}
      style={{ height: containerHeight }}
    >
      <AutoSizer>{List}</AutoSizer>
    </div>
  );
};

export default OrderBookList;
