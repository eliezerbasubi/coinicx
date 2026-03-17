import { useEffect, useMemo, useReducer, useState } from "react";
import { ChevronDown } from "lucide-react";

import { ScaleDistribution } from "@/types/trade";
import Visibility from "@/components/common/Visibility";
import AdaptiveDialog from "@/components/ui/adaptive-dialog";
import AdaptivePopover from "@/components/ui/adaptive-popover";
import { formatPriceToDecimal, formatSize } from "@/features/trade/utils";
import { useTradeContext } from "@/store/trade/hooks";
import { useShallowInstrumentStore } from "@/store/trade/instrument";
import {
  useOrderFormStore,
  useShallowOrderFormStore,
} from "@/store/trade/order-form";
import { useShallowUserTradeStore } from "@/store/trade/user-trade";
import { cn } from "@/utils/cn";

import OrderFormInput from "./OrderFormInput";
import TrailingQuote from "./TrailingQuote";

const MAX_ORDERS = 100;
const MIN_ORDERS = 2;

type State = {
  startPrice: string;
  endPrice: string;
  totalOrders: string;
  skew: string;
};

const ScaleOrderForm = () => {
  const { scaleDistribution, size } = useShallowOrderFormStore((s) => ({
    scaleDistribution: s.scaleDistribution,
    size: s.size,
  }));

  const totalSize = useMemo(
    () => useOrderFormStore.getState().getSizeInBase(),
    [size],
  );

  const [state, dispatch] = useReducer(
    (prev: State, next: Partial<State>) => ({ ...prev, ...next }),
    {
      startPrice: "",
      endPrice: "",
      totalOrders: "",
      skew: "1",
    },
  );

  const onValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const parsedValue = parseFloat(value);

    if (name === "skew" && parsedValue > 100) return;
    if (name === "totalOrders" && (parsedValue < 1 || parsedValue > MAX_ORDERS))
      return;

    dispatch({
      [name]: value,
    });
  };

  const scaleOrder = useMemo(() => {
    const { startPrice, endPrice, totalOrders, skew } = state;

    const orderCount = parseFloat(totalOrders || "0");

    if (!startPrice || !endPrice || orderCount < MIN_ORDERS || !totalSize) {
      return [];
    }

    const orders = [];
    const skewFactor = parseFloat(skew || "1");

    const countMinusOne = orderCount - 1;
    const step =
      (parseFloat(endPrice) - parseFloat(startPrice)) / countMinusOne;

    for (let i = 0; i < orderCount; i++) {
      const price = parseFloat(startPrice) + i * step;
      if (!price) return [];

      let size: number;

      if (scaleDistribution === "equal") {
        size = totalSize / orderCount;
      } else {
        // Linear weights scaled by skew:
        // - Increasing: weight grows with index (first order smallest, last largest)
        // - Decreasing: weight shrinks with index (first order largest, last smallest)
        // Skew of 0 → equal sizes; higher skew → steeper ramp.
        const weight =
          scaleDistribution === "increasing"
            ? 1 + i * skewFactor
            : 1 + (countMinusOne - i) * skewFactor;

        size = weight;
      }

      orders.push({
        price,
        size,
      });
    }

    // Normalize sizes so they sum to totalSize
    if (scaleDistribution !== "equal") {
      const rawTotal = orders.reduce((sum, o) => sum + o.size, 0);
      for (const order of orders) {
        order.size = (order.size / rawTotal) * totalSize;
      }
    }
    return orders;
  }, [
    state.endPrice,
    state.startPrice,
    state.totalOrders,
    state.skew,
    scaleDistribution,
    totalSize,
  ]);

  useEffect(() => {
    useOrderFormStore.getState().setScaleOrder(scaleOrder);
  }, [scaleOrder]);

  return (
    <div className="w-full space-y-1 md:space-y-2">
      <OrderFormInput
        name="startPrice"
        id="startPrice"
        label="Start Price"
        trailing={<TrailingQuote />}
        value={state.startPrice}
        onChange={onValueChange}
      />
      <OrderFormInput
        name="endPrice"
        id="endPrice"
        label="End Price"
        trailing={<TrailingQuote />}
        value={state.endPrice}
        onChange={onValueChange}
      />

      <div className="grid grid-cols-2 gap-2">
        <OrderFormInput
          name="totalOrders"
          id="totalOrders"
          label="Orders"
          placeholder={`(${MIN_ORDERS}-${MAX_ORDERS})`}
          className="placeholder:text-xs"
          min={MIN_ORDERS}
          max={MAX_ORDERS}
          value={state.totalOrders}
          onChange={onValueChange}
        />
        <OrderFormInput
          name="skew"
          id="skew"
          label="Skew"
          min={1}
          max={100}
          value={state.skew}
          onChange={onValueChange}
        />
      </div>

      <SizeDistribution />
    </div>
  );
};

const DISTRIBUTIONS = [
  {
    title: "Equal",
    value: "equal",
    description: "All orders have equal size",
  },
  {
    title: "Increasing",
    value: "increasing",
    description: "Size increases linearly with price",
  },
  {
    title: "Decreasing",
    value: "decreasing",
    description: "Size decreases linearly with price",
  },
] as const;

const SizeDistribution = () => {
  const scaleDistribution = useShallowOrderFormStore(
    (s) => s.scaleDistribution,
  );

  const [open, setOpen] = useState(false);

  const onDistributionChange = (value: ScaleDistribution) => {
    useOrderFormStore.getState().setScaleDistribution(value);
    setOpen(false);
  };

  return (
    <div className="w-full space-y-1 md:space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-3xs md:text-xs text-neutral-gray-400 font-medium">
          Size Distribution
        </p>
        <PreviewOrders />
      </div>
      <div className="w-full flex justify-between items-center">
        <AdaptivePopover
          open={open}
          onOpenChange={setOpen}
          align="start"
          className="p-0"
          trigger={
            <div className="w-full h-6 md:h-9 bg-neutral-gray-200 flex items-center text-white space-x-1 px-2 rounded-md md:rounded-lg">
              <p className="flex-1 text-3xs md:text-xs font-medium cursor-pointer capitalize">
                {scaleDistribution}
              </p>
              <ChevronDown
                strokeWidth={2.5}
                className="transition-transform group-data-[state=open]:rotate-180 size-3 md:size-4"
              />
            </div>
          }
        >
          {DISTRIBUTIONS.map((distribution) => (
            <button
              key={distribution.value}
              className={cn(
                "w-full text-left px-4 py-2 hover:bg-neutral-gray-200 outline-0",
                {
                  "bg-neutral-gray-200":
                    scaleDistribution === distribution.value,
                },
              )}
              onClick={() => onDistributionChange(distribution.value)}
            >
              <p className="text-sm font-medium text-white">
                {distribution.title}
              </p>
              <p className="text-xs font-medium text-neutral-gray-400">
                {distribution.description}
              </p>
            </button>
          ))}
        </AdaptivePopover>
      </div>
    </div>
  );
};

const PreviewOrders = () => {
  const { quote, base, decimals } = useTradeContext((s) => ({
    quote: s.quote,
    base: s.base,
    decimals: s.decimals ?? 5,
  }));

  const szDecimals = useShallowInstrumentStore(
    (s) => s.assetMeta?.szDecimals ?? 5,
  );

  const leverage = useShallowUserTradeStore((s) => s.leverage?.value ?? 1);

  const { scaleOrder, isBuyOrder } = useShallowOrderFormStore((s) => ({
    scaleOrder: s.scaleOrder,
    isBuyOrder: s.orderSide === "buy",
  }));

  const { orderValue, totalSize, hasSmallestOrder } = useMemo(() => {
    return scaleOrder.reduce(
      (acc, order) => {
        const orderValue = order.price * order.size;

        return {
          orderValue: acc.orderValue + orderValue,
          totalSize: acc.totalSize + order.size,
          hasSmallestOrder: acc.hasSmallestOrder || orderValue < 10,
        };
      },
      { orderValue: 0, totalSize: 0, hasSmallestOrder: false },
    );
  }, [scaleOrder]);

  const avgPrice = orderValue ? orderValue / totalSize : 0;
  const margin = orderValue ? orderValue / leverage : 0;

  const [open, setOpen] = useState(false);

  return (
    <AdaptiveDialog
      open={open}
      onOpenChange={setOpen}
      title="Preview Scaled Orders"
      className="px-4 md:px-0 sm:max-w-md"
      trigger={
        <p className="text-primary text-3xs md:text-xs font-semibold cursor-pointer">
          Preview
        </p>
      }
    >
      <div className="w-full">
        <div className="grid grid-cols-3 gap-2">
          <p className="text-xs font-medium text-neutral-gray-400">
            Price ({quote})
          </p>
          <p className="text-xs font-medium text-neutral-gray-400">
            Size ({base})
          </p>
          <p className="text-xs font-medium text-neutral-gray-400">
            Order Value ({quote})
          </p>
        </div>
        <div className="w-full max-h-100 overflow-y-auto">
          {scaleOrder
            .sort((a, b) =>
              isBuyOrder ? b.price - a.price : a.price - b.price,
            )
            .map((order, index) => {
              const percentage = (order.size / Number(totalSize)) * 100;

              return (
                <div key={index} className="grid grid-cols-3 gap-2 py-1">
                  <p className="text-xs font-medium text-white">
                    {formatPriceToDecimal(order.price, decimals)}
                  </p>
                  <p className="text-xs font-medium text-white space-x-0.5">
                    <span>{formatSize(order.size.toString(), szDecimals)}</span>
                    <span className="text-neutral-gray-400">
                      ({percentage.toFixed(2)}%)
                    </span>
                  </p>
                  <p className="text-xs font-medium text-white">
                    {formatPriceToDecimal(order.price * order.size, decimals)}
                  </p>
                </div>
              );
            })}
        </div>

        <Visibility visible={!scaleOrder.length}>
          <div className="w-full h-24 flex flex-col items-center justify-center">
            <p className="text-xs font-medium text-white">
              No orders to preview
            </p>
            <p className="text-xs font-medium text-neutral-gray-400">
              Set the number of orders to preview
            </p>
          </div>
        </Visibility>
        <Visibility visible={hasSmallestOrder}>
          <div className="w-full p-2 mt-3 rounded-lg text-primary text-center bg-primary/10 space-y-1">
            <p className="text-xs font-medium">
              Smallest order must have a minimum value of 10 USD
            </p>
          </div>
        </Visibility>

        <div className="w-full p-2 mt-3 rounded-lg bg-neutral-gray-600 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-neutral-gray-400">
              Average Price
            </p>
            <p className="text-xs font-medium text-white">
              {formatPriceToDecimal(avgPrice, 2, { symbol: quote })}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-neutral-gray-400">Margin</p>
            <p className="text-xs font-medium text-white">
              {formatPriceToDecimal(margin, 2, { symbol: quote })}
            </p>
          </div>
        </div>
      </div>
    </AdaptiveDialog>
  );
};

export default ScaleOrderForm;
