import {
  useOrderFormStore,
  useShallowOrderFormStore,
} from "@/lib/store/trade/order-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const ReduceOnly = () => {
  const reduceOnly = useShallowOrderFormStore((s) => s.settings.reduceOnly);

  return (
    <div className="flex-1 flex items-center gap-2">
      <Checkbox
        id="reduceOnly"
        checked={reduceOnly}
        className="size-3.5 border-neutral-gray-400 data-[state=checked]:bg-white data-[state=checked]:text-primary-dark data-[state=checked]:border-white"
        onCheckedChange={(checked) => {
          // If the user is checking the checkbox, we set showTpSl to false
          useOrderFormStore.getState().setSettings({
            reduceOnly: !!checked,
            showTpSl: false,
          });
        }}
      />
      <Label htmlFor="reduceOnly" className="text-white text-3xs md:text-xs">
        <p>Reduce Only</p>
      </Label>
    </div>
  );
};

export default ReduceOnly;
