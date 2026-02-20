import React from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useTradeContext } from "@/store/trade/hooks";

const ReduceOnly = () => {
  const reduceOnly = useTradeContext((s) => s.orderFormSettings.reduceOnly);
  const setOrderFormSettings = useTradeContext((s) => s.setOrderFormSettings);

  return (
    <div className="flex-1 flex items-center gap-2">
      <Checkbox
        id="reduceOnly"
        checked={reduceOnly}
        className="size-3.5 border-neutral-gray-400 data-[state=checked]:bg-white data-[state=checked]:text-primary-dark data-[state=checked]:border-white"
        onCheckedChange={(checked) =>
          setOrderFormSettings({ reduceOnly: !!checked, showTpSl: false })
        }
      />
      <Label htmlFor="reduceOnly" className="text-neutral-gray-400 text-xs">
        <p>Reduce Only</p>
      </Label>
    </div>
  );
};

export default ReduceOnly;
