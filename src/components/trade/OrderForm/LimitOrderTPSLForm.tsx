import React, { useReducer, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { OrderFormLimitOffsetType } from "@/types/trade";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTradeContext } from "@/store/trade/hooks";

import OrderFormInput from "./OrderFormInput";

type State = {
  tpLimit: string;
  tpLimitOffset: string;
  slTrigger: string;
  slTriggerOffset: string;
  tpOffsetType: OrderFormLimitOffsetType;
  slOffsetType: OrderFormLimitOffsetType;
};

const LimitOrderTPSLForm = () => {
  const [state, dispatch] = useReducer(
    (prev: State, next: Partial<State>) => ({ ...prev, ...next }),
    {
      tpLimit: "",
      tpLimitOffset: "",
      tpOffsetType: "offset",
      slOffsetType: "offset",
      slTrigger: "",
      slTriggerOffset: "",
    },
  );

  const onValueChange = ({ name, value }: { name: string; value: string }) => {
    dispatch({ [name]: value });
  };

  return (
    <div className="w-full space-y-3">
      <div className="w-full">
        <p className="text-xs font-medium mb-2 text-neutral-gray-400">
          Take Profit
        </p>

        <div className="flex items-center gap-1">
          <OrderFormInput
            label="TP Limit"
            name="tpLimit"
            id="tpLimit"
            value={state.tpLimit}
            wrapperClassName="flex-1"
            onChange={({ target: { name, value } }) =>
              onValueChange?.({ name, value })
            }
          />
          <OffsetTypeInput
            name="tpLimitOffset"
            value={state.tpLimitOffset}
            type={state.tpOffsetType}
            onValueChange={onValueChange}
            onTypeChange={(type) =>
              onValueChange?.({ name: "tpOffsetType", value: type })
            }
          />
        </div>
      </div>
      <div className="w-full">
        <p className="text-xs font-medium mb-2 text-neutral-gray-400">
          Stop Loss
        </p>

        <div className="flex items-center gap-1">
          <OrderFormInput
            label="SL Trigger"
            name="slTrigger"
            id="slTrigger"
            value={state.slTrigger}
            wrapperClassName="flex-1"
            onChange={({ target: { name, value } }) =>
              onValueChange?.({ name, value })
            }
          />
          <OffsetTypeInput
            name="slTriggerOffset"
            value={state.slTriggerOffset}
            type={state.slOffsetType}
            onValueChange={onValueChange}
            onTypeChange={(type) =>
              onValueChange?.({ name: "slOffsetType", value: type })
            }
          />
        </div>
      </div>
    </div>
  );
};

type OffsetInputProps = {
  name: string;
  value: string | number;
  type?: OrderFormLimitOffsetType;
  onValueChange?: (args: { name: string; value: string }) => void;
  onTypeChange?: (type: string) => void;
};

const LIMIT_OFFSET_TYPES = [
  {
    label: "Offset% / ROI%",
    value: "offset",
    tooltipContent:
      "Set TP/SL prices based on percentage change relative to the main order's price. Offset% and ROI% are the same for spot",
  },
  {
    label: "PnL",
    value: "pnl",
    tooltipContent: "Set TP/SL prices based on estimated PnL",
  },
];

const OffsetTypeInput = ({
  name,
  value,
  type,
  onValueChange,
  onTypeChange,
}: OffsetInputProps) => {
  const quoteAsset = useTradeContext((s) => s.quoteAsset);

  const [open, setOpen] = useState(false);

  return (
    <OrderFormInput
      name={name}
      id={name}
      value={value}
      onChange={({ target: { name, value } }) =>
        onValueChange?.({ name, value })
      }
      wrapperClassName="flex-[0.5_1_0%] min-w-[104px]"
      placeholder={type === "pnl" ? "PNL" : "Offset"}
      className="placeholder:text-neutral-gray-400 placeholder:text-left placeholder:text-sm"
      trailing={
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger className="w-fit h-full flex items-center justify-between shrink-0">
            <span className="text-sm text-white font-semibold mx-1">
              {type === "pnl" ? quoteAsset : "%"}
            </span>
            <ChevronDown className="size-3 stroke-4 text-neutral-gray-400" />
          </PopoverTrigger>
          <PopoverContent
            side="bottom"
            align="end"
            sideOffset={5}
            className="w-36 px-0 py-1"
          >
            {LIMIT_OFFSET_TYPES.map((limitOffset) => (
              <Tooltip key={limitOffset.value}>
                <TooltipTrigger asChild className="w-full">
                  <div
                    key={limitOffset.value}
                    role="button"
                    tabIndex={0}
                    onKeyDown={() => null}
                    className="w-full flex items-center space-x-2 p-2 hover:bg-neutral-gray-200"
                    onClick={() => {
                      onTypeChange?.(limitOffset.value);
                      setOpen(false);
                    }}
                  >
                    <p className="text-sm font-semibold text-neutral-300">
                      {limitOffset.label}
                    </p>

                    {limitOffset.value === type && (
                      <Check className="size-3 stroke-4 text-neutral-300 shrink-0" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-64 text-neutral-gray-500 font-medium">
                  {limitOffset.tooltipContent}
                </TooltipContent>
              </Tooltip>
            ))}
          </PopoverContent>
        </Popover>
      }
    />
  );
};

export default LimitOrderTPSLForm;
