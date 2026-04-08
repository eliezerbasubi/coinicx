import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import { Button } from "@/components/ui/button";
import { MarketEvent } from "@/features/predict/types";

type Props = {
  asChild?: boolean;
  currentSideIndex?: number;
  sides: MarketEvent["sides"];
  className?: string;
  wrapperClassName?: string;
  label?: string;
  onClick?: (
    sideIndex: number,
    e?: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => void;
};

const MarketSideActions = ({
  asChild,
  sides,
  className,
  label,
  wrapperClassName,
  currentSideIndex,
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
            asChild={asChild}
            type="button"
            variant="ghost"
            onClick={(e) => onClick?.(index, e)}
            className={cn(
              "bg-buy/10 text-buy hover:bg-buy hover:text-white transition-colors duration-200",
              {
                "bg-sell/10 text-sell hover:bg-sell hover:text-white":
                  index === 1,
              },
              // We want the className to overwrite default presets
              className,
              {
                "bg-buy text-white": index === currentSideIndex && index === 0,
                "bg-sell text-white": index === currentSideIndex && index === 1,
              },
            )}
          >
            <p className="flex items-center gap-1">
              <span>
                {label && <span>{label}</span>} <span>{side.name}</span>
              </span>
              <span>
                {formatNumber(contractShare, {
                  maximumFractionDigits: 1,
                })}
                ¢
              </span>
            </p>
          </Button>
        );
      })}
    </div>
  );
};

export default MarketSideActions;
