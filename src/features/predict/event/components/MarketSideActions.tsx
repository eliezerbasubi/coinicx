import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import { Button } from "@/components/ui/button";
import { MarketEvent } from "@/features/predict/types";

type Props = {
  sides: MarketEvent["sides"];
  className?: string;
  wrapperClassName?: string;
  label?: string;
  onClick?: (sideIndex: number) => void;
};

const MarketSideActions = ({
  sides,
  className,
  label,
  wrapperClassName,
  onClick,
}: Props) => {
  return (
    <div className={wrapperClassName}>
      {sides.map((side, index) => {
        const price = side.midPx || side.markPx;

        const contractShare = price * 100;

        return (
          <Button
            key={side.coin}
            type="button"
            variant="ghost"
            onClick={() => onClick?.(index)}
            className={cn(
              className,
              "bg-buy/10 text-buy hover:bg-buy hover:text-white",
              {
                "bg-sell/10 text-sell hover:bg-sell hover:text-white":
                  index === 1,
              },
            )}
          >
            <span>
              {label && <span>{label}</span>} <span>{side.name}</span>
            </span>
            <span>
              {formatNumber(contractShare, {
                maximumFractionDigits: 1,
              })}
              ¢
            </span>
          </Button>
        );
      })}
    </div>
  );
};

export default MarketSideActions;
