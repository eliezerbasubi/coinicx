import React from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

const LimitOrderTPSL = ({ checked, onCheckedChange }: Props) => {
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id="takeProfitAndStopLoss"
        checked={checked}
        className="data-[state=checked]:bg-white data-[state=checked]:text-primary-dark data-[state=checked]:border-white"
        onCheckedChange={onCheckedChange}
      />
      <Label htmlFor="takeProfitAndStopLoss">
        <Tooltip>
          <TooltipTrigger asChild type="button" className="cursor-help text-sm">
            <p>TP/SL</p>
          </TooltipTrigger>
          <TooltipContent className="max-w-80 text-neutral-gray-500 text-xs font-medium">
            <p>
              Set Take Profit and Stop Loss in advance. Based on your trading
              strategy, you can choose to use a Limit-Maker order for Take
              Profit and a Stop Limit (or Stop Market) order for Stop Loss.
            </p>
          </TooltipContent>
        </Tooltip>
      </Label>
    </div>
  );
};

export default LimitOrderTPSL;
