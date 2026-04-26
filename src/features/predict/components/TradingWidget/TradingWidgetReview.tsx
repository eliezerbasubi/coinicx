import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatting/numbers";

type Props = {
  className?: string;
};
const TradingWidgetReview = ({ className }: Props) => {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm md:text-base text-neutral-gray-400 font-medium leading-5">
          Order Value
        </p>
        <p className="text-base md:text-xl font-medium">
          {formatNumber(0, { style: "currency" })}
        </p>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm md:text-base text-neutral-gray-400 font-medium leading-5">
          To Win
        </p>
        <p className="text-base md:text-xl font-semibold text-buy">
          {formatNumber(0, { style: "currency" })}
        </p>
      </div>
    </div>
  );
};

export default TradingWidgetReview;
