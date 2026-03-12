import React, { useCallback, useRef, useState } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList } from "react-window";
import { useMediaQuery } from "usehooks-ts";

import {
  CumulativePriceLevel,
  OrderBookDisplayOrientation,
  OrderBookType,
  PriceLevel,
} from "@/types/orderbook";
import { useIsMobile } from "@/hooks/useIsMobile";
import Visibility from "@/components/common/Visibility";
import { useTradeContext } from "@/store/trade/hooks";
import { useShallowOrderBookStore } from "@/store/trade/orderbook";
import { cn } from "@/utils/cn";

import AveragePriceTooltip from "./AveragePriceTooltip";
import OrderBookTableRow from "./OrderBookTableRow";

type Props = {
  side: OrderBookType;
  className?: string;
  orientation?: OrderBookDisplayOrientation;
};

const VISIBLE_ROWS = 10;
const MAX_VISIBLE_ROWS = 17;
const ROW_HEIGHT = 20;

/** Number of visible rows to display on a tablet viewport for orderbook layout type */
const TABLET_OB_VISIBLE_ROWS = 3;

/** Number of visible rows to display on a tablet viewport for sell and buy layout type */
const TABLET_LAYOUT_VISIBLE_ROWS = 6;

const OrderBookList = ({
  side,
  className,
  orientation = "vertical",
}: Props) => {
  const { priceLevels, layout, averageAndSum, depthVisualizer } =
    useShallowOrderBookStore((s) => ({
      priceLevels: s[side],
      layout: s.layout,
      averageAndSum: s.settings.averageAndSum,
      depthVisualizer: s.settings.depthVisualizer,
    }));

  const decimals = useTradeContext((state) => state.decimals);

  const isMobile = useIsMobile();
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1023px)"); // Exclude laptop breakpoint(1024px)

  const [hoverIndex, setHoverIndex] = useState(0);
  const scrollHeight = useRef(0);

  const isOrderbookLayout = layout === "orderBook";
  let containerHeight = !isOrderbookLayout ? 425 : 200;
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
    itemCount = 20;
    containerHeight = 20 * ROW_HEIGHT;
  }

  // Show only TABLET_OB_VISIBLE_ROWS items for order book layout on tablet and the rest for other layouts
  if (isTablet) {
    if (isOrderbookLayout) {
      itemCount = TABLET_OB_VISIBLE_ROWS;
      containerHeight = ROW_HEIGHT * TABLET_OB_VISIBLE_ROWS;
    } else {
      // We preserve the default item count
      containerHeight = ROW_HEIGHT * TABLET_LAYOUT_VISIBLE_ROWS;
    }
  }

  const List = useCallback(
    (props: { width: number; height: number }) => {
      // Make asks scroll to the bottom by default
      const initialScrollOffset =
        layout === "sellOrder"
          ? Math.max(0, priceLevels.length * ROW_HEIGHT - props.height)
          : 0;

      return (
        <>
          <FixedSizeList
            key={layout}
            {...props}
            itemData={priceLevels}
            itemCount={itemCount}
            itemSize={ROW_HEIGHT}
            layout="vertical"
            initialScrollOffset={initialScrollOffset}
            onScroll={({ scrollOffset }) => {
              scrollHeight.current = scrollOffset;
            }}
          >
            {Row}
          </FixedSizeList>

          {/* Hide average tooltip on tablet */}
          <Visibility visible={!isTablet}>
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
          </Visibility>
        </>
      );
    },
    [
      priceLevels,
      layout,
      hoverIndex,
      averageAndSum,
      side,
      isTablet,
      orientation,
    ],
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
      const askIndex =
        orientation === "horizontal" ? index : itemCount - 1 - index;
      const element = side === "asks" ? data[askIndex] : data[index];

      if (element) {
        const { px: price, sz: amount } = element;

        let progress = 0;

        if (depthVisualizer === "cumulative" && "total" in element) {
          const maxCumAmount = (data[data.length - 1] as CumulativePriceLevel)
            .total;
          const cumAmount = element.total;

          if (maxCumAmount && cumAmount) {
            progress = cumAmount / maxCumAmount;
          }
        } else {
          // We consider the first item for the highest amount
          const highestAmount = data[0].sz;
          progress = Number(amount) / Number(highestAmount);
        }

        return (
          <OrderBookTableRow
            key={index}
            side={side}
            price={Number(price)}
            amount={Number(amount)}
            decimals={decimals}
            progress={progress >= 1 ? 1 : progress}
            style={style}
            onMouseEnter={() => setHoverIndex(index)}
          />
        );
      }

      // We add fragment to push asks to the bottom and bids to top when the number of items is less than the visible rows
      // React-window will consider these fragments as items but they won't be rendered as elements on the DOM
      return <React.Fragment key={index} />;
    },
    [itemCount, depthVisualizer, decimals, side, orientation],
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
