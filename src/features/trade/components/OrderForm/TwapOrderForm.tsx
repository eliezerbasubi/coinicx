import { useReducer } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { convertTimeToMinutes } from "@/features/trade/utils/twap";
import {
  useOrderFormStore,
  useShallowOrderFormStore,
} from "@/store/trade/order-form";
import { cn } from "@/utils/cn";

import OrderFormInput from "./OrderFormInput";

type State = {
  hours: string;
  minutes: string;
};

const FEATURED_PERIODS = [
  { value: 10, unit: "m", minutes: 10 },
  { value: 30, unit: "m", minutes: 30 },
  { value: 1, unit: "h", minutes: 60 },
  { value: 8, unit: "h", minutes: 480 },
  { value: 12, unit: "h", minutes: 720 },
  { value: 24, unit: "h", minutes: 1440 },
];

const PERIOD_UNITS = {
  h: "hours",
  m: "minutes",
} as Record<string, keyof State>;

const PERIOD_MAX_VALUES = {
  hours: 23,
  minutes: 59,
};

const TwapOrderForm = () => {
  const [state, dispatch] = useReducer(
    (prev: State, next: Partial<State>) => ({ ...prev, ...next }),
    {
      hours: "",
      minutes: "",
    },
  );

  const twapMinutes = convertTimeToMinutes({
    hours: state.hours,
    minutes: state.minutes,
  });

  const onValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (!value) {
      dispatch({ [name]: "" });
      return;
    }

    const max = PERIOD_MAX_VALUES[name as keyof typeof PERIOD_MAX_VALUES];
    const periodValue = Math.min(Number(value), max).toString();

    dispatch({ [name]: periodValue });

    const twapMinutes = convertTimeToMinutes({
      ...state,
      [name]: periodValue,
    });

    useOrderFormStore.getState().setTwapOrder({ minutes: twapMinutes });
  };

  return (
    <div className="w-full space-y-1 md:space-y-2">
      <div className="w-full space-y-1">
        <div className="w-full flex items-center justify-between md:mb-2">
          <p className="text-3xs md:text-xs text-neutral-gray-400 font-medium">
            Running Time (5m - 24h)
          </p>

          <button
            type="button"
            className="text-3xs md:text-xs text-primary font-medium"
            onClick={() => {
              dispatch({ hours: "23", minutes: "59" });
            }}
          >
            Max
          </button>
        </div>

        <div className="grid grid-cols-2 gap-x-1">
          <OrderFormInput
            name="hours"
            id="hours"
            label="Hours"
            placeholder="0"
            value={state.hours}
            onChange={onValueChange}
          />
          <OrderFormInput
            name="minutes"
            id="minutes"
            label="Minutes"
            placeholder="0"
            value={state.minutes}
            onChange={onValueChange}
          />
        </div>
        <div className="w-full flex items-center gap-x-1">
          {FEATURED_PERIODS.map((period) => {
            return (
              <Badge
                key={period.value + period.unit}
                value={period.value}
                unit={period.unit}
                isSelected={twapMinutes === period.minutes}
                onClick={() => {
                  const unit = PERIOD_UNITS[period.unit];

                  const params = {
                    hours: "0",
                    minutes: "0",
                    [unit]: period.value,
                  };

                  dispatch(params);
                }}
              />
            );
          })}
        </div>
      </div>

      <TwapRandomize />
    </div>
  );
};

const Badge = ({
  value,
  unit,
  isSelected,
  onClick,
}: {
  value: number;
  unit: string;
  isSelected?: boolean;
  onClick?: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 flex items-center justify-center gap-x-2 border border-neutral-gray-200 text-neutral-gray-400 rounded-md px-2 py-1",
        { "border-primary/50 text-white": isSelected },
      )}
    >
      <span className="text-2xs md:text-xs font-medium">
        {value}
        {unit}
      </span>
    </button>
  );
};

const TwapRandomize = () => {
  const randomize = useShallowOrderFormStore((s) => s.twapOrder.randomize);

  return (
    <div className="flex-1 flex items-center gap-2 mt-3">
      <Checkbox
        id="randomize"
        checked={randomize}
        className="size-3.5 border-neutral-gray-400 data-[state=checked]:bg-white data-[state=checked]:text-primary-dark data-[state=checked]:border-white"
        onCheckedChange={(checked) =>
          useOrderFormStore.getState().setTwapOrder({
            randomize: !!checked,
          })
        }
      />
      <Label htmlFor="randomize" className="text-white text-3xs md:text-xs">
        <p>Randomize</p>
      </Label>
    </div>
  );
};

export default TwapOrderForm;
