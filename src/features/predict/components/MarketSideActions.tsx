import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import { Button } from "@/components/ui/button";
import { MarketEvent, SideSpec } from "@/features/predict/lib/types";

type MarketSideButtonProps = {
  side: SideSpec;
  index: number;
  asChild?: boolean;
  isCurrent?: boolean;
  className?: string;
  label?: string;
  onClick?: (
    sideIndex: number,
    e?: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => void;
};

export const MarketSideButton = ({
  side,
  index,
  asChild,
  isCurrent,
  className,
  label,
  onClick,
}: MarketSideButtonProps) => {
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
        "bg-buy/10 text-buy hover:bg-buy hover:text-white transition-colors duration-200 cursor-pointer",
        {
          "bg-sell/10 text-sell hover:bg-sell hover:text-white": index === 1,
        },
        // We want the className to overwrite default presets
        className,
        {
          "bg-buy text-white": isCurrent && index === 0,
          "bg-sell text-white": isCurrent && index === 1,
        },
      )}
    >
      <p className="flex items-center gap-1">
        <span className="line-clamp-1">
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
};

type MarketSideActionsProps = {
  currentSideIndex?: number;
  sides: MarketEvent["sides"];
  className?: string;
  wrapperClassName?: string;
} & Pick<MarketSideButtonProps, "asChild" | "label" | "onClick">;

export const MarketSideActions = ({
  asChild,
  sides,
  className,
  label,
  wrapperClassName,
  currentSideIndex,
  onClick,
}: MarketSideActionsProps) => {
  return (
    <div className={wrapperClassName}>
      {sides.map((side, index) => (
        <MarketSideButton
          key={side.coin}
          side={side}
          index={index}
          asChild={asChild}
          isCurrent={currentSideIndex === index}
          className={className}
          label={label}
          onClick={onClick}
        />
      ))}
    </div>
  );
};
