import { useShallowOrderBookStore } from "@/lib/store/trade/orderbook";
import { OrderBookOrientation } from "@/lib/types/orderbook";
import { cn } from "@/lib/utils/cn";
import { useTradeContext } from "@/features/trade/store/hooks";

type Props = {
  className?: string;
  orientation?: OrderBookOrientation;
  showTotal?: boolean;
};

export const OrderBookTableHeader = ({
  className,
  orientation,
  showTotal,
}: Props) => {
  if (orientation === "horizontal") {
    return <OrderBookHorizontalTableHeader className={className} />;
  }

  return (
    <OrderBookVerticalTableHeader showTotal={showTotal} className={className} />
  );
};

type HeaderProps = {
  showTotal?: boolean;
  className?: string;
};

export const OrderBookVerticalTableHeader = ({
  className,
  showTotal,
}: HeaderProps) => {
  const { base, quote } = useTradeContext((state) => ({
    base: state.assetMeta.base,
    quote: state.assetMeta.quote,
  }));

  return (
    <OrderBookTableHeaderRow
      base={base}
      quote={quote}
      className={cn("px-4", className)}
      showTotal={showTotal}
    />
  );
};

export const OrderBookHorizontalTableHeader = ({
  className,
}: {
  className?: string;
}) => {
  const isOrderbookLayout = useShallowOrderBookStore(
    (s) => s.layout === "orderBook",
  );

  return (
    <div
      className={cn("grid grid-cols-2 gap-2 px-4", className, {
        "grid-cols-1": !isOrderbookLayout,
      })}
    >
      <OrderBookTableHeaderRow showTotal={!isOrderbookLayout} />
      <OrderBookTableHeaderRow className={cn({ hidden: !isOrderbookLayout })} />
    </div>
  );
};

type OrderBookTableHeaderRowProps = {
  className?: string;
  quote?: string;
  base?: string;
  showTotal?: boolean;
};

export const OrderBookTableHeaderRow = ({
  className,
  base,
  quote,
  showTotal,
}: OrderBookTableHeaderRowProps) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between text-3xs md:text-xs font-medium text-neutral-gray-400 py-1",
        className,
      )}
    >
      <div className="flex-1">
        <p>Price {quote && `(${quote})`}</p>
      </div>
      <div className="flex-1 text-right">
        <p>Amount {base && `(${base})`} </p>
      </div>
      {showTotal && (
        <div className="flex-1 text-right">
          <p>Total {quote && `(${quote})`}</p>
        </div>
      )}
    </div>
  );
};
