import { ArrowLeftRight, PlusCircle } from "lucide-react";

import { useAccountTransactStore } from "@/lib/store/trade/account-transact";
import { useShallowOrderFormStore } from "@/lib/store/trade/order-form";
import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import { useAvailableToTrade } from "@/hooks/useAvailableToTrade";
import Visibility from "@/components/common/Visibility";
import { useTradeContext } from "@/features/trade/store/hooks";
import { isUSDCQuote } from "@/features/trade/utils/shared";

const AvailableBalance = () => {
  const { isSpot, base, quote } = useTradeContext((s) => ({
    isSpot: s.instrumentType === "spot",
    base: s.assetMeta.base,
    quote: s.assetMeta.quote,
  }));

  const isBuyOrder = useShallowOrderFormStore((s) => s.orderSide === "buy");
  const availableBalance = useAvailableToTrade({
    isBuyOrder,
    spotAsset: isSpot ? { base, quote } : undefined,
  });

  const isSwapable = !isSpot && !isUSDCQuote(quote);

  return (
    <div className="flex items-center justify-between">
      <p className="text-3xs md:text-xs text-neutral-gray-400">Available</p>

      <button
        type="button"
        className={cn(
          "flex items-center gap-x-1 outline-0 cursor-pointer hover:text-primary",
          { "underline text-primary": isSwapable },
        )}
        onClick={() => {
          if (isSwapable) {
            useAccountTransactStore.getState().openSwapModal(quote ?? "");
          } else {
            useAccountTransactStore.getState().openAccountTransact("deposit");
          }
        }}
      >
        <p className="text-3xs md:text-xs font-medium space-x-1">
          <span>
            {formatNumber(availableBalance, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
              symbol: isSpot ? (isBuyOrder ? quote : base) : quote,
              roundingMode: "floor",
            })}
          </span>
        </p>
        <Visibility
          visible={!isSwapable}
          fallback={<ArrowLeftRight className="size-3.5 text-primary" />}
        >
          <PlusCircle className="size-3.5 text-primary" />
        </Visibility>
      </button>
    </div>
  );
};

export default AvailableBalance;
