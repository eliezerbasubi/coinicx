import React, { memo, useMemo } from "react";

import { OrderBookType, PriceLevel } from "@/types/orderbook";
import { useTradeContext } from "@/store/trade/hooks";
import { cn } from "@/utils/cn";
import { formatNumber } from "@/utils/formatting/numbers";

type Props = {
  hoveredIndex: number;
  rowHeight: number;
  containerHeight: number;
  itemCount: number;
  scrollHeight: number;
  type: OrderBookType;
  data: PriceLevel[];
};

const AveragePriceTooltip = ({
  hoveredIndex,
  rowHeight,
  containerHeight,
  scrollHeight,
  type,
  itemCount,
  data,
}: Props) => {
  const isBids = type === "bids";

  const incrementedIndex = hoveredIndex + 1;

  const offsetY = rowHeight * incrementedIndex - scrollHeight;
  const y = Math.round(containerHeight - offsetY);

  // const y = isBids
  //   ? containerHeight - rowHeight * incrementedIndex
  //   : (itemCount - hoveredIndex) * rowHeight;

  // Calculate cumulative totals by looping through the data in decremental order starting from:
  // For bids: Hovered index to zero
  // For asks: Item count minus hovered index to get the proper index of the element as the asks were mapped in reverse
  const cumulativeTotals = useMemo(() => {
    let priceSum = 0;
    let amountSum = 0;

    const length = isBids ? hoveredIndex + 1 : itemCount - hoveredIndex;

    for (let i = length - 1; i >= 0; i--) {
      const element = data?.[i];

      if (element) {
        const [price, amount] = data[i];

        priceSum += Number(price);
        amountSum += Number(amount);
      }
    }

    const avgPrice = priceSum / length;

    return { avgPrice, amountSum, total: avgPrice * amountSum };
  }, [isBids, hoveredIndex, itemCount, data]);

  return (
    <div className="absolute right-0 z-50 hidden group-hover/orderbook-list:block">
      <div
        className="absolute z-50 min-w-52 rounded-md px-3 py-1.5 bg-neutral-gray-200 text-xs text-gray-300 space-y-1"
        style={{
          transform: `translate(0px, calc(-50% - ${y}px))`,
        }}
      >
        <div className="flex items-center justify-between">
          <p>Avg. Price</p>
          <p>
            ≈{" "}
            {formatNumber(cumulativeTotals.avgPrice, {
              maximumFractionDigits: 5,
            })}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <SumLabel type="baseAsset" />
          <p>
            {formatNumber(cumulativeTotals.amountSum, {
              maximumFractionDigits: 5,
            })}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <SumLabel type="quoteAsset" />
          <p>
            {formatNumber(cumulativeTotals.total, {
              maximumFractionDigits: 5,
            })}
          </p>
        </div>

        <span
          className={cn(
            "absolute left-0 -translate-x-2 translate-y-[calc(-50%_-_30px)] border-8 border-l-0 border-transparent border-r-neutral-gray-200",
            { "translate-y-[calc(-50%_-_40px)]": !isBids },
          )}
        />
      </div>
    </div>
  );
};

const SumLabel = ({ type }: { type: "baseAsset" | "quoteAsset" }) => {
  const asset = useTradeContext((s) => s[type]);

  return <p>Sum {asset}:</p>;
};

export default memo(AveragePriceTooltip);
