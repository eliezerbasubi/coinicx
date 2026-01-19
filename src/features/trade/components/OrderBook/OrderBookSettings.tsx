"use client";

import React from "react";
import { MoreVertical } from "lucide-react";

import { IOrderBookSettings } from "@/types/orderbook";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useOrderBookStore } from "@/store/trade/orderbook";

const OrderBookSettings = () => {
  const setSettings = useOrderBookStore((state) => state.setSettings);
  const onDepthVisualizerChange = useOrderBookStore(
    (state) => state.onDepthVisualizerChange,
  );

  const settings = useOrderBookStore((state) => state.settings);

  const onCheckedChange = (name: string, value: boolean) =>
    setSettings({ [name]: value });

  return (
    <Popover>
      <PopoverTrigger key="orderbook-settings-trigger">
        <MoreVertical className="text-neutral-gray-300 size-4 stroke-3" />
      </PopoverTrigger>
      <PopoverContent align="end" className="p-3 w-52">
        <div className="w-full space-y-3">
          <p className="text-xs font-medium text-neutral-gray-300">
            Order Book Display
          </p>

          <CheckboxTile
            checked={settings.averageAndSum}
            name="averageAndSum"
            label="Display Avg.&Sum"
            onCheckedChange={onCheckedChange}
          />
          <CheckboxTile
            checked={settings.showBuyAndSellRatio}
            name="showBuyAndSellRatio"
            label="Show Buy/Sell Ratio"
            onCheckedChange={onCheckedChange}
          />
          <CheckboxTile
            checked={settings.rounding}
            name="rounding"
            label="Rounding"
            onCheckedChange={onCheckedChange}
          />
        </div>
        <div className="w-full space-y-3 pt-4 mt-4 border-t border-neutral-gray-200">
          <p className="text-xs font-medium text-neutral-gray-300">
            Book Depth Visualization
          </p>

          <RadioGroup
            value={settings.depthVisualizer}
            name="depthVisualizer"
            defaultValue="amount"
            onValueChange={(value) =>
              onDepthVisualizerChange(
                value as IOrderBookSettings["depthVisualizer"],
              )
            }
            className="w-full"
          >
            <div className="w-full flex items-center gap-2">
              <RadioGroupItem value="amount" id="amount" />
              <Label htmlFor="amount" className="w-full cursor-pointer">
                Amount
              </Label>
            </div>
            <div className="w-full flex items-center gap-2">
              <RadioGroupItem value="cumulative" id="cumulative" />
              <Label htmlFor="cumulative" className="w-full cursor-pointer">
                Cumulative
              </Label>
            </div>
          </RadioGroup>
        </div>
      </PopoverContent>
    </Popover>
  );
};

type CheckboxTileProps = {
  name: string;
  label: string;
  checked?: boolean;
  onCheckedChange?: (name: string, value: boolean) => void;
};

const CheckboxTile = ({
  name,
  label,
  checked,
  onCheckedChange,
}: CheckboxTileProps) => {
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id={name}
        name={name}
        checked={checked}
        onCheckedChange={(checked) => onCheckedChange?.(name, !!checked)}
      />
      <Label htmlFor={name} className="w-full cursor-pointer">
        {label}
      </Label>
    </div>
  );
};

export default React.memo(OrderBookSettings);
