import { useRef } from "react";
import { Home, RefreshCcwDot, TrendingUp, User } from "lucide-react";
import { useWebHaptics } from "web-haptics/react";

import { MobileViewTab } from "@/lib/types/trade";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";

type Props = {
  value: string;
  onValueChange?: (value: MobileViewTab) => void;
};

const BOTTOM_NAV_TABS = [
  { label: "Home", value: "home", icon: <Home /> },
  { label: "Markets", value: "markets", icon: <TrendingUp /> },
  { label: "Trade", value: "trade", icon: <RefreshCcwDot /> },
  { label: "Account", value: "account", icon: <User /> },
] as const;

const GAP = 8;
const PADDING = 4;
const MAX_WIDTH = 300;

const BottomNavigationBar = ({ value, onValueChange }: Props) => {
  const haptic = useWebHaptics();

  const currentNavItemIndex = BOTTOM_NAV_TABS.findIndex(
    (item) => item.value === value,
  );

  const ref = useRef<HTMLDivElement>(null);

  const itemsCount = BOTTOM_NAV_TABS.length;

  const width = ref.current?.getBoundingClientRect().width ?? MAX_WIDTH;

  const effectiveWidth = width - PADDING - GAP;

  return (
    <div className="fixed bottom-4 inset-x-0 z-10 h-14">
      <div
        ref={ref}
        style={{
          gap: GAP,
          padding: PADDING,
          maxWidth: MAX_WIDTH,
        }}
        className="relative isolate w-full max-w-xs mx-auto flex items-center border border-neutral-gray-200 bg-trade-dark rounded-full"
      >
        {BOTTOM_NAV_TABS.map((item) => (
          <Button
            key={item.value}
            type="button"
            size="lg"
            variant="ghost"
            className={cn(
              "h-11 flex-1 flex flex-col gap-y-0.5 items-center justify-center [&>svg]:size-4! px-0!",
              {
                "text-primary": item.value === value,
              },
            )}
            onClick={() => {
              haptic.trigger("selection");
              onValueChange?.(item.value);
            }}
          >
            {item.icon}
            <p className="text-2xs font-medium">{item.label}</p>
          </Button>
        ))}
        <div
          style={{
            width: `calc(100%/${itemsCount})`,
            transform: `translateX(${Math.floor(effectiveWidth / itemsCount) * currentNavItemIndex}px)`,
          }}
          className="absolute inset-y-1 -z-1 bg-neutral-gray-200 rounded-full transition-transform will-change-transform ease-in-out"
        />
      </div>
    </div>
  );
};

export default BottomNavigationBar;
