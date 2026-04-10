import React, { useCallback } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList } from "react-window";

import { OrderBookType, PriceLevel } from "@/lib/types/orderbook";
import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatting/numbers";

const ROW_HEIGHT = 36;
const VISIBLE_ROWS = 8;

const MarketEventOrderBookList = ({
  items,
  type,
}: {
  items: PriceLevel[];
  type: OrderBookType;
}) => {
  const containerHeight = VISIBLE_ROWS * ROW_HEIGHT;

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
      // Handle empty data
      if (!data?.length) {
        return (
          <OrderBookTableRow
            key={index}
            type={type}
            price={0}
            amount={0}
            progress={50}
            style={style}
          />
        );
      }
      // For Asks, Read items in reverse to align them from the lowest to the highest
      const itemCount = data.length;
      const askIndex = itemCount - 1 - index;
      const element = type === "asks" ? data[askIndex] : data[index];

      if (element) {
        const { px: price, sz: amount } = element;

        // We consider the first item for the highest amount
        const highestAmount = data[0].sz;
        const progress = Number(amount) / Number(highestAmount);

        return (
          <OrderBookTableRow
            key={index}
            price={Number(price)}
            amount={Number(amount)}
            progress={progress}
            style={style}
            type={type}
            showLabelType={
              type === "bids" ? index === 0 : index === data.length - 1
            }
          />
        );
      }

      // We add fragment to push asks to the bottom and bids to top when the number of items is less than the visible rows
      // React-window will consider these fragments as items but they won't be rendered as elements on the DOM
      return <React.Fragment key={index} />;
    },
    [],
  );

  const List = useCallback(
    (props: { width: number; height: number }) => {
      // Make asks scroll to the bottom by default
      const initialScrollOffset =
        type === "asks"
          ? Math.max(0, items.length * ROW_HEIGHT - props.height)
          : 0;

      return (
        <FixedSizeList
          key={type}
          {...props}
          itemData={items}
          itemCount={items.length}
          itemSize={ROW_HEIGHT}
          initialScrollOffset={initialScrollOffset}
          layout="vertical"
          className="no-scrollbars"
        >
          {Row}
        </FixedSizeList>
      );
    },
    [items, type],
  );

  return (
    <div
      className="relative z-5 will-change-transform"
      style={{ height: containerHeight }}
    >
      <AutoSizer>{List}</AutoSizer>
    </div>
  );
};

const OrderBookTableRow = ({
  price,
  amount,
  type,
  progress,
  style,
  showLabelType,
}: {
  price: number;
  amount: number;
  progress: number;
  type: OrderBookType;
  style?: React.CSSProperties;
  showLabelType?: boolean;
}) => {
  const xPos = Math.round(-100 + progress * 100);

  return (
    <div
      key={price + "" + amount + "" + type}
      style={style}
      className={cn(
        "relative h-9 grid grid-cols-[40%_20%_20%_20%] overflow-hidden hover:bg-buy/15",
        {
          "hover:bg-sell/15": type === "asks",
        },
      )}
    >
      <div className="w-full">
        <div
          data-progress={progress}
          style={{
            // Positive xPos means the price is higher than the mid price, so we translate from left to right
            transform: `translateX(${Math.min(xPos, xPos * -1)}%)`,
          }}
          className={cn(
            "absolute -z-10 inset-0 translate-x-0 bg-buy/20 transition-transform duration-500",
            {
              "bg-sell/20": type === "asks",
            },
          )}
        />
      </div>
      <div className="h-full flex items-center justify-center px-2">
        <p
          className={cn("text-sm font-medium text-buy", {
            "text-sell": type === "asks",
          })}
        >
          {formatNumber(price * 100, {
            maximumFractionDigits: 1,
          })}
          ¢
        </p>
      </div>
      <div className="h-full flex items-center justify-center px-2">
        <p className="text-sm font-medium text-neutral-gray-100">
          {formatNumber(Number(amount))}
        </p>
      </div>
      <div className="h-full flex items-center justify-center px-2">
        <p className="text-sm font-medium text-neutral-gray-100">
          {formatNumber(Number(price) * Number(amount), {
            style: "currency",
          })}
        </p>
      </div>

      {showLabelType && (
        <div
          className={cn(
            "absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none py-1 px-1.5 rounded-lg bg-buy text-white",
            {
              "bg-sell": type === "asks",
            },
          )}
        >
          <p className="text-xs capitalize font-medium">{type}</p>
        </div>
      )}
    </div>
  );
};

export default MarketEventOrderBookList;
