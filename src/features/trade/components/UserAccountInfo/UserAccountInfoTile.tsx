import React from "react";

import { cn } from "@/lib/utils/cn";
import AdaptiveTooltip from "@/components/ui/adaptive-tooltip";

type Props = {
  title?: string;
  label: string;
  className?: string;
  variant?: "neutral" | "positive" | "negative";
  tooltipContent: string;
  value: React.ReactNode;
};

const UserAccountInfoTile = ({
  title,
  label,
  tooltipContent,
  value,
  className,
  variant = "neutral",
}: Props) => {
  return (
    <div className={cn("flex items-center justify-between text-xs", className)}>
      <AdaptiveTooltip
        variant="underline"
        className="max-w-fit"
        title={title || label}
        trigger={<p className="text-neutral-gray-400">{label}</p>}
      >
        <p>{tooltipContent}</p>
      </AdaptiveTooltip>
      <p
        className={cn("text-white font-medium", {
          "text-buy": variant === "positive",
          "text-sell": variant === "negative",
        })}
      >
        {value}
      </p>
    </div>
  );
};

export default UserAccountInfoTile;
