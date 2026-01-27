import { PlusCircle } from "lucide-react";

import { useTradeContext } from "@/store/trade/hooks";
import { useInstrumentStore } from "@/store/trade/instrument";
import { useAvailableToTrade } from "@/store/trade/user-trade";
import { formatNumber } from "@/utils/formatting/numbers";

const AvailableBalance = ({ isBuyOrder }: { isBuyOrder: boolean }) => {
  const base = useInstrumentStore((s) => s.assetMeta?.base);
  const quote = useInstrumentStore((s) => s.assetMeta?.quote);
  const isPerps = useTradeContext((s) => s.instrumentType === "perps");
  const availableBalance = useAvailableToTrade(isBuyOrder);

  return (
    <div className="flex items-center justify-between">
      <p className="text-xs text-neutral-gray-400">Available Balance</p>

      <button type="button" className="flex items-center gap-x-1 outline-0">
        <p className="text-xs font-medium space-x-1">
          <span>
            {(!availableBalance && "0.00") || formatNumber(availableBalance)}
          </span>
          <span>{!isPerps ? (isBuyOrder ? quote : base) : quote}</span>
        </p>
        <PlusCircle className="size-3.5 text-primary" />
      </button>
    </div>
  );
};

export default AvailableBalance;
