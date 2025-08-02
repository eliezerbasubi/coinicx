"use client";

import React from "react";
import { MoreVertical } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const OrderBookSettings = () => {
  const onCheckedChange = (name: string, value: string | boolean) => {
    console.log("🚨 - OrderBookSettings.tsx - 18", { name, value });
  };

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
            name="averageAndSum"
            label="Display Avg.&Sum"
            onCheckedChange={onCheckedChange}
          />
          <CheckboxTile
            name="buyAndShowRatio"
            label="Show Buy/Sell Ratio"
            onCheckedChange={onCheckedChange}
          />
          <CheckboxTile
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
            defaultValue="amount"
            onValueChange={(value) => {
              console.log("🚨 - OrderBookSettings.tsx - 60", { value });
            }}
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="amount" id="amount" />
              <Label htmlFor="amount">Amount</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="cumulative" id="cumulative" />
              <Label htmlFor="cumulative">Cumulative</Label>
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
  onCheckedChange?: (name: string, value: boolean) => void;
};

const CheckboxTile = ({ name, label, onCheckedChange }: CheckboxTileProps) => {
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id={name}
        name={name}
        onCheckedChange={(checked) => onCheckedChange?.(name, !!checked)}
      />
      <Label htmlFor={name}>{label}</Label>
    </div>
  );
};

export default OrderBookSettings;
