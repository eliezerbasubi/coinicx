import React, { useRef, useState } from "react";
import { ListChecks } from "lucide-react";

import { useChartSettingsStore } from "@/lib/store/trade/chart-settings";
import AdaptivePopover from "@/components/ui/adaptive-popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const OrdersSettings = () => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  const showQuickOrder = useChartSettingsStore((s) => s.showQuickOrder);
  const showPosition = useChartSettingsStore((s) => s.showPosition);
  const showOrder = useChartSettingsStore((s) => s.showOrder);
  const showHistoricalOrders = useChartSettingsStore(
    (s) => s.showHistoricalOrders,
  );
  const showLiquidationPrice = useChartSettingsStore(
    (s) => s.showLiquidationPrice,
  );

  const setSettings = useChartSettingsStore((s) => s.setSettings);

  const onCheckedChange = (name: string, value: boolean) =>
    setSettings({ [name]: value });

  return (
    <div className="text-neutral-gray-400">
      <div
        ref={triggerRef}
        role="button"
        tabIndex={0}
        className="px-2"
        onClick={() => setOpen(!open)}
      >
        <ListChecks className="size-4" />
      </div>

      <AdaptivePopover
        triggerRef={triggerRef}
        open={open}
        onOpenChange={setOpen}
        className="w-full"
      >
        <div className="w-full space-y-2">
          <CheckboxTile
            checked={showQuickOrder}
            name="showQuickOrder"
            label="Quick Order"
            onCheckedChange={onCheckedChange}
          />
          <CheckboxTile
            checked={showPosition}
            name="showPosition"
            label="Position"
            onCheckedChange={onCheckedChange}
          />
          <CheckboxTile
            checked={showOrder}
            name="showOrder"
            label="Order"
            onCheckedChange={onCheckedChange}
          />
          <CheckboxTile
            checked={showHistoricalOrders}
            name="showHistoricalOrders"
            label="Historical Orders"
            onCheckedChange={onCheckedChange}
          />
          <CheckboxTile
            checked={showLiquidationPrice}
            name="showLiquidationPrice"
            label="Liquidation Price"
            onCheckedChange={onCheckedChange}
          />
        </div>
      </AdaptivePopover>
    </div>
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

export default OrdersSettings;
