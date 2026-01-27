import React from "react";
import { useShallow } from "zustand/react/shallow";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTradeContext } from "@/store/trade/hooks";

import LimitOrderTPSLForm from "./LimitOrderTPSLForm";

const LimitOrderTPSL = () => {
  const showTpSl = useTradeContext(
    useShallow((s) => s.orderFormSettings.showTpSl),
  );
  const setOrderFormSettings = useTradeContext((s) => s.setOrderFormSettings);

  return (
    <>
      <div className="flex items-center gap-2">
        <Checkbox
          id="takeProfitAndStopLoss"
          checked={showTpSl}
          className="size-3.5 border-neutral-gray-400 data-[state=checked]:bg-white data-[state=checked]:text-primary-dark data-[state=checked]:border-white"
          onCheckedChange={(checked) =>
            setOrderFormSettings({ showTpSl: Boolean(checked) })
          }
        />
        <Label htmlFor="takeProfitAndStopLoss">
          <Tooltip>
            <TooltipTrigger
              asChild
              type="button"
              className="cursor-help text-xs text-neutral-gray-400"
            >
              <p>TP/SL</p>
            </TooltipTrigger>
            <TooltipContent className="max-w-80 text-neutral-gray-400 text-xs font-medium">
              <p>
                Set Take Profit and Stop Loss in advance. Based on your trading
                strategy, you can choose to use a Limit-Maker order for Take
                Profit and a Stop Limit (or Stop Market) order for Stop Loss.
              </p>
            </TooltipContent>
          </Tooltip>
        </Label>
      </div>

      {showTpSl && <LimitOrderTPSLForm />}
    </>
  );
};

export default LimitOrderTPSL;
