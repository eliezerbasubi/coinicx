import { useWebHaptics } from "web-haptics/react";

import { cn } from "@/lib/utils/cn";

type Props = {
  maxLeverage: number;
  value: string;
  onValueChange?: (value: string) => void;
};

const LeverageDiscreteSlider = ({
  maxLeverage,
  value,
  onValueChange,
}: Props) => {
  const haptic = useWebHaptics();

  const tickInterval = maxLeverage > 5 ? 5 : 2;

  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const x = e.touches[0].clientX - left;
    const percentage = x / width;
    const leverage = Math.floor(percentage * maxLeverage);

    // The leverage is 1-indexed, so we need to add 1 to the leverage
    onValueChange?.((leverage + 1).toString());
  };

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    const percentage = x / width;
    const leverage = Math.floor(percentage * maxLeverage);

    // The leverage is 1-indexed, so we need to add 1 to the leverage
    onValueChange?.((leverage + 1).toString());
    haptic.trigger("medium");
  };

  return (
    <div onClick={onClick} onTouchMove={onTouchMove} className="w-full px-2">
      <div className="relative flex items-end justify-between py-6">
        {Array.from({ length: maxLeverage }).map((_, index) => (
          <div key={index} className="flex flex-col items-center gap-y-0.5">
            <div
              className={cn("w-1 h-5 rounded-full bg-white", {
                "h-8": (index + 1) % tickInterval === 0,
                "bg-primary h-9": index + 1 === Number(value),
              })}
            />
            {maxLeverage <= 10 && (
              <span className="text-2xs text-neutral-gray-400 font-medium">
                {index + 1}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeverageDiscreteSlider;
