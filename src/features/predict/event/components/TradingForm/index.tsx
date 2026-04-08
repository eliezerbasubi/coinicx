import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { OrderType } from "@/lib/types/trade";
import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import FormInputControl from "@/components/common/FormInputControl";
import TradingButton from "@/components/common/TradingButton";
import AdaptiveTooltip from "@/components/ui/adaptive-tooltip";
import { Button } from "@/components/ui/button";
import { InputNumberControl } from "@/components/ui/input-number";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMarketEventContext } from "@/features/predict/store/market-event/hooks";
import TIFSelector from "@/features/trade/components/OrderForm/TIFSelector";
import { SUPPORTED_ORDER_TYPES } from "@/features/trade/constants";

import MarketSideActions from "../MarketSideActions";
import AmountCurrencySelector from "./AmountCurrencySelector";

type Props = {
  className?: string;
};

const TradingForm = ({ className }: Props) => {
  const { marketEvent, activeMarketOutcome } = useMarketEventContext((s) => ({
    marketEvent: s.marketEvent,
    activeMarketOutcome: s.activeMarketOutcome,
  }));

  const [open, setOpen] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [side, setSide] = useState(0);

  const currentMarketOutcome = activeMarketOutcome ?? marketEvent;

  return (
    <div className={cn("w-full", className)}>
      <div className="px-4 pt-4">
        <p className="text-sm font-medium text-white">
          {currentMarketOutcome.title}
        </p>
        <p className="text-xs font-medium text-neutral-gray-400">
          <span>
            {formatNumber(currentMarketOutcome.sides[side]?.volume ?? 0, {
              style: "currency",
              notation: "compact",
            })}
          </span>
          <span className="ml-1">Vol</span>
        </p>
      </div>

      <Tabs defaultValue="buy">
        <TabsList
          variant="line"
          className="w-full flex items-center justify-between px-4"
        >
          <TabsTrigger value="buy" className="flex-0 text-sm">
            Buy
          </TabsTrigger>
          <TabsTrigger value="sell" className="flex-0 text-sm">
            Sell
          </TabsTrigger>

          <div className="flex-1 flex justify-end">
            <AdaptiveTooltip
              open={open}
              hideArrow
              side="bottom"
              title="Order Types"
              onOpenChange={setOpen}
              delayDuration={0}
              trigger={
                <div
                  className={cn(
                    "w-full md:w-fit px-2 md:px-0 flex items-center gap-x-1 justify-between md:justify-start text-xs md:text-sm font-semibold bg-neutral-gray-200 md:bg-transparent text-neutral-gray-400 rounded-md md:rounded-none cursor-pointer",
                  )}
                  onClick={() => setOpen(!open)}
                >
                  <p>Market</p>
                  <ChevronDown className="size-5 text-neutral-gray-400" />
                </div>
              }
            >
              <ul className="w-full text-sm md:text-xs text-neutral-gray-400 font-medium">
                {Object.values(SUPPORTED_ORDER_TYPES).map((type) => {
                  if (type.perpsOnly) return null;
                  return (
                    <li
                      key={type.value}
                      onClick={() => {
                        setOpen(false);
                        setOrderType(type.value);
                      }}
                      className={cn(
                        "flex items-center justify-between py-2 px-0 md:px-2 cursor-pointer hover:bg-neutral-gray-200 hover:text-white",
                        {
                          "font-semibold text-white md:bg-neutral-gray-200":
                            type.value === orderType,
                        },
                      )}
                    >
                      <span>{type.label}</span>
                      {type.value === orderType && (
                        <Check className="size-3 stroke-4 text-neutral-300 shrink-0" />
                      )}
                    </li>
                  );
                })}
              </ul>
            </AdaptiveTooltip>
          </div>
        </TabsList>
      </Tabs>

      <MarketSideActions
        sides={currentMarketOutcome.sides}
        wrapperClassName="grid grid-cols-2 gap-2 p-4"
        onClick={(sideIndex) => setSide(sideIndex)}
      />

      <div className="w-full px-4">
        <div className="w-full border-b border-neutral-gray-200 pb-4 mb-4">
          <InputNumberControl
            name="amount"
            label="Limit Price"
            placeholder="0.00"
            wrapperClassName="pr-1"
            max={100}
            min={0}
            trailing={
              <Button
                type="button"
                variant="ghost"
                className="w-6 h-5 md:size-6 bg-neutral-gray-200 text-neutral-300 hover:text-primary hover:bg-primary/10 text-3xs md:text-xs font-medium md:font-semibold rounded md:rounded-md"
                onClick={() => {}}
              >
                Mid
              </Button>
            }
          />
        </div>
        <div className="w-full">
          <div className="flex justify-end">
            <AmountCurrencySelector onValueChange={() => {}} />
          </div>
          <FormInputControl
            name="amount"
            label={
              <div className="flex flex-col gap-y-1">
                <p className="text-sm text-white">Amount</p>
                <p className="text-xs text-neutral-gray-400 font-medium">
                  Available: 0.00
                </p>
              </div>
            }
            placeholder="0.00"
            wrapperClassName="border-none my-4 px-0"
            percentClassName="px-1.5"
            className="text-2xl"
            max={100}
            min={0}
          />
        </div>

        <div className="w-full border-t border-neutral-gray-200 pt-4 mt-4">
          <TIFSelector className="w-full justify-end mb-3" />
          <div className="flex items-center justify-between mb-2">
            <p className="text-base text-neutral-gray-400 font-medium leading-5">
              Order Value
            </p>
            <p className="text-xl font-medium">
              {formatNumber(0, { style: "currency" })}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-base text-neutral-gray-400 font-medium leading-5">
              To Win
            </p>
            <p className="text-xl font-semibold text-buy">
              {formatNumber(0, { style: "currency" })}
            </p>
          </div>
        </div>
      </div>
      <div className="px-4 mt-4">
        <TradingButton label="Trade" />
      </div>
    </div>
  );
};

export default TradingForm;
