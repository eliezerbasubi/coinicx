import React from "react";

import { Button } from "@/components/ui/button";
import { useUserTradeStore } from "@/store/trade/user-trade";

const AdjustTradeSettings = () => {
  const leverage = useUserTradeStore((s) => s.leverage);

  if (!leverage) return null;

  return (
    <div className="w-full flex items-center gap-2 px-4 h-10">
      {/* User Margin type */}
      <Button
        variant="secondary"
        size="sm"
        className="h-7 flex-1 text-white text-xs capitalize"
      >
        {leverage.type}
      </Button>
      {/* User max Leverage */}
      <Button
        variant="secondary"
        size="sm"
        className="h-7 flex-1 text-white text-xs"
      >
        {leverage.value}x
      </Button>
      {/* User Account unification mode */}
      <Button
        variant="secondary"
        size="sm"
        className="h-7 flex-1 text-white text-xs"
      >
        Classic
      </Button>
    </div>
  );
};

export default AdjustTradeSettings;
