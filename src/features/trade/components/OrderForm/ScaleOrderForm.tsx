import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { ChevronDown } from "lucide-react";

import { ScaleDistribution } from "@/types/trade";
import Visibility from "@/components/common/Visibility";
import AdaptiveDialog from "@/components/ui/adaptive-dialog";
import AdaptivePopover from "@/components/ui/adaptive-popover";
import {
  formatPriceToDecimal,
  formatSize,
  parseOrderPrice,
} from "@/features/trade/utils";
import { useTradeContext } from "@/store/trade/hooks";
import { useShallowInstrumentStore } from "@/store/trade/instrument";
import {
  useOrderFormStore,
  useShallowOrderFormStore,
} from "@/store/trade/order-form";
import { useShallowUserTradeStore } from "@/store/trade/user-trade";
import { cn } from "@/utils/cn";

import { OrderFormInput, TrailingQuote } from "./OrderFormInput";

const MAX_ORDERS = 100;
const MIN_ORDERS = 2;

type State = {
  startPrice: string;
  endPrice: string;
  totalOrders: string;
  skew: string;
  triggerDistance: string;
};

const ScaleOrderForm = () => {
  const orderType = useOrderFormStore((s) => s.settings.orderType);

  const { scaleDistribution, isBuyOrder } = useShallowOrderFormStore((s) => ({
    scaleDistribution: s.scaleDistribution,
    isBuyOrder: s.orderSide === "buy",
  }));

  const totalSize = useOrderFormStore.getState().getSizeInBase();

  const [state, dispatch] = useReducer(
    (prev: State, next: Partial<State>) => ({ ...prev, ...next }),
    {
      startPrice: "",
      endPrice: "",
      totalOrders: "",
      skew: "1",
      triggerDistance: "",
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

  const scaleOrders = useMemo(() => {
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

    const baseSize = (2 * totalSize) / (orderCount * (1 + skewFactor));
    const sizeStep = (baseSize * skewFactor - baseSize) / countMinusOne;

    for (let i = 0; i < orderCount; i++) {
      const price = parseFloat(startPrice) + i * step;
      if (!price) return [];

      const size = baseSize + i * sizeStep;

      orders.push({
        price,
        size,
        triggerPrice: null,
      });
    }
    return orders;
  }, [
    state.endPrice,
    state.startPrice,
    state.totalOrders,
    state.skew,
    state.triggerDistance,
    scaleDistribution,
    totalSize,
  ]);

  const scaleOrder = useMemo(() => {
    if (scaleDistribution === "conditional") {
      const offset = parseFloat(state.triggerDistance || "0");

      return scaleOrders.map((order) => ({
        ...order,
        triggerPrice: isBuyOrder ? order.price + offset : order.price - offset,
      }));
    }

    if (scaleDistribution === "sequential") {
      let prevTriggerPrice: number | null = null;

      return scaleOrders
        .sort((a, b) => (isBuyOrder ? b.price - a.price : a.price - b.price))
        .map((order) => {
          const scaleOrder = {
            ...order,
            triggerPrice: prevTriggerPrice,
          };

          prevTriggerPrice = order.price;
          return scaleOrder;
        });
    }
    return scaleOrders;
  }, [state.triggerDistance, scaleOrders, scaleDistribution, isBuyOrder]);

  useEffect(() => {
    useOrderFormStore.getState().setScaleOrder(scaleOrder);
  }, [scaleOrder]);

  if (orderType !== "scale") return null;

  return (
    <div className="w-full space-y-2">
      <OrderFormInput
        name="startPrice"
        id="startPrice"
        label="Start Price"
        className="text-sm"
        trailing={<TrailingQuote />}
        value={state.startPrice}
        onChange={onValueChange}
      />
      <OrderFormInput
        name="endPrice"
        id="endPrice"
        label="End Price"
        className="text-sm"
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
          className="text-sm placeholder:text-xs"
          min={MIN_ORDERS}
          max={MAX_ORDERS}
          value={state.totalOrders}
          onChange={onValueChange}
        />
        <OrderFormInput
          name="skew"
          id="skew"
          label="Skew"
          className="text-sm"
          min={1}
          max={100}
          value={state.skew}
          onChange={onValueChange}
        />
      </div>

      <SizeDistribution
        triggerDistance={state.triggerDistance}
        onValueChange={(value) => dispatch({ triggerDistance: value })}
      />
    </div>
  );
};

const DISTRIBUTIONS = [
  {
    title: "Normal",
    value: "normal",
    description: "All orders are placed at the same time",
  },
  {
    title: "Sequential",
    value: "sequential",
    description: "Orders are placed one after another",
  },
  {
    title: "Conditional",
    value: "conditional",
    description:
      "Each order is visible on the order book only when its trigger price is hit.",
  },
] as const;

type SizeDistributionProps = {
  triggerDistance: string;
  onValueChange: (value: string) => void;
};

const SizeDistribution = ({
  triggerDistance,
  onValueChange,
}: SizeDistributionProps) => {
  const scaleDistribution = useShallowOrderFormStore(
    (s) => s.scaleDistribution,
  );

  const [open, setOpen] = useState(false);

  const onDistributionChange = (value: ScaleDistribution) => {
    useOrderFormStore.getState().setScaleDistribution(value);
    setOpen(false);
  };

  const onTriggerDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange(e.target.value);
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-neutral-gray-400 font-medium">
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
            <div className="w-full h-9 bg-neutral-gray-200 flex items-center text-white space-x-1 px-2 rounded-lg">
              <p className="flex-1 text-xs font-medium cursor-pointer capitalize">
                {scaleDistribution}
              </p>
              <ChevronDown
                strokeWidth={2.5}
                className="transition-transform group-data-[state=open]:rotate-180 size-4"
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
      <Visibility visible={scaleDistribution === "conditional"}>
        <OrderFormInput
          name="triggerDistance"
          id="triggerDistance"
          label="Trigger Distance"
          className="text-sm"
          trailing={<TrailingQuote />}
          value={triggerDistance}
          onChange={onTriggerDistanceChange}
        />
      </Visibility>
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

  const { orderValue, totalSize } = useMemo(() => {
    return scaleOrder.reduce(
      (acc, order) => {
        return {
          orderValue: acc.orderValue + order.price * order.size,
          totalSize: acc.totalSize + order.size,
        };
      },
      { orderValue: 0, totalSize: 0 },
    );
  }, [scaleOrder]);

  const avgPrice = orderValue / totalSize;
  const margin = orderValue / leverage;

  const [open, setOpen] = useState(false);

  return (
    <AdaptiveDialog
      open={open}
      onOpenChange={setOpen}
      title="Preview Scaled Orders"
      className="sm:max-w-md"
      trigger={
        <p className="text-primary text-xs font-semibold cursor-pointer">
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
            Trigger Condition
          </p>
        </div>
        <div className="w-full max-h-[400px] overflow-y-auto">
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
                    {order.triggerPrice
                      ? `${isBuyOrder ? "Below" : "Above"} ${formatPriceToDecimal(
                          order.triggerPrice,
                          decimals,
                        )}`
                      : "Immediate"}
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

        <div className="w-full p-2 mt-3 rounded-lg bg-neutral-gray-600 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-white">Average Price</p>
            <p className="text-xs font-medium text-white">
              {formatPriceToDecimal(avgPrice, 2)} {quote}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-white">Total Value</p>
            <p className="text-xs font-medium text-white">
              {formatPriceToDecimal(orderValue, 2)} {quote}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-white">Margin</p>
            <p className="text-xs font-medium text-white">
              {formatPriceToDecimal(margin, 2)} {quote}
            </p>
          </div>
        </div>
      </div>
    </AdaptiveDialog>
  );
};

export default ScaleOrderForm;
