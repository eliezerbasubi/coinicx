import React, { useCallback, useRef, useState } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList } from "react-window";

import { useTradeContext } from "@/lib/store/trade/hooks";
import { useShallowOrderBookStore } from "@/lib/store/trade/orderbook";
import {
  CumulativePriceLevel,
  OrderBookOrientation,
  OrderBookType,
  PriceLevel,
} from "@/lib/types/orderbook";
import { cn } from "@/lib/utils/cn";
import Visibility from "@/components/common/Visibility";

import AveragePriceTooltip from "./AveragePriceTooltip";
import OrderBookTableRow from "./OrderBookTableRow";

type Props = {
  side: OrderBookType;
  className?: string;
  hideAvgPriceTooltip?: boolean;
  orientation?: OrderBookOrientation;

  /** Number of visible rows for orderbook layout type */
  orderbookVisibleRows?: number;

  /** Number of visible rows for buy or sell order layout type */
  sideVisibleRows?: number;

  /** If true, side layout will display only the visible items. Affect single side layouts only */
  disableScrolling?: boolean;
  hideCumulativeTotal?: boolean;
};

const VISIBLE_ROWS = 10;
const ROW_HEIGHT = 20;

const OrderBookList = ({
  side,
  className,
  disableScrolling,
  hideAvgPriceTooltip,
  orderbookVisibleRows,
  sideVisibleRows,
  hideCumulativeTotal,
  orientation = "vertical",
}: Props) => {
  const { priceLevels, layout, averageAndSum, depthVisualizer, rounding } =
    useShallowOrderBookStore((s) => ({
      priceLevels: s[side],
      layout: s.layout,
      averageAndSum: s.settings.averageAndSum,
      depthVisualizer: s.settings.depthVisualizer,
      rounding: s.settings.rounding,
    }));

  const decimals = useTradeContext((state) => state.decimals);

  const [hoverIndex, setHoverIndex] = useState(0);
  const scrollHeight = useRef(0);

  const isOrderbookLayout = layout === "orderBook";
  const priceLevelsSize = priceLevels.length;

  const visibleRows = isOrderbookLayout
    ? (orderbookVisibleRows ?? VISIBLE_ROWS)
    : (sideVisibleRows ?? priceLevelsSize);

  const containerHeight = visibleRows * ROW_HEIGHT;

  const itemCount =
    !disableScrolling && !isOrderbookLayout ? priceLevelsSize : visibleRows;

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
          <Visibility visible={!hideAvgPriceTooltip}>
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
      hideAvgPriceTooltip,
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
            rounding={rounding}
            progress={progress >= 1 ? 1 : progress}
            hideCumulativeTotal={
              hideCumulativeTotal ||
              (orientation === "horizontal" && layout === "orderBook")
            }
            style={style}
            onMouseEnter={() => setHoverIndex(index)}
          />
        );
      }

      // We add fragment to push asks to the bottom and bids to top when the number of items is less than the visible rows
      // React-window will consider these fragments as items but they won't be rendered as elements on the DOM
      return <React.Fragment key={index} />;
    },
    [
      itemCount,
      depthVisualizer,
      decimals,
      rounding,
      layout,
      side,
      orientation,
      hideCumulativeTotal,
    ],
  );

  return (
    <div
      className={cn(
        "relative z-5 will-change-transform group/orderbook-list",
        className,
      )}
      style={{ height: containerHeight }}
    >
      <AutoSizer>{List}</AutoSizer>
    </div>
  );
};

export default OrderBookList;
