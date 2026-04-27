import { Gavel, LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import Visibility from "@/components/common/Visibility";
import { useMarketEventContext } from "@/features/predict/lib/store/market-event/hooks";
import { formatExpiryDate } from "@/features/predict/lib/utils/parseMetadata";

type Props = {
  children: React.ReactNode;
};

const OutcomeResults = ({ children }: Props) => {
  const { status, settledSideName, settledPrice, expiry } =
    useMarketEventContext((s) => ({
      status: s.marketEventMeta.status,
      settledSideName:
        s.marketEventMeta.settledSide !== undefined
          ? s.marketEventMeta.sides[s.marketEventMeta.settledSide].name
          : null,
      settledPrice:
        s.marketEventMeta.settlement && "price" in s.marketEventMeta.settlement
          ? s.marketEventMeta.settlement.price
          : null,
      expiry: s.marketEventMeta.recurringPayload?.expiry,
    }));

  if (status !== "settled" && status !== "waitingForSettlement") {
    return children;
  }

  return (
    <div className="w-full bg-neutral-gray-600 rounded-lg px-4 py-6 flex flex-col items-center justify-center gap-6">
      <Gavel
        className={cn("size-10 text-primary", {
          "animate-gavel": status === "waitingForSettlement",
          "animate-gavel-strike": status === "settled",
        })}
      />

      <p
        className={cn("text-xl font-medium text-primary space-x-1", {
          "text-lg": status === "waitingForSettlement",
        })}
      >
        <Visibility
          visible={status === "settled"}
          fallback="Hold on, determining the outcome."
        >
          <span>Outcome:</span>
          <span>{settledSideName}</span>
        </Visibility>
      </p>

      <Visibility visible={!!expiry && status === "settled"}>
        <p className="text-neutral-gray-400 text-sm text-center">
          This outcome was settled based on the mark price of {settledPrice} on
          &nbsp;
          {formatExpiryDate(expiry!)}.
        </p>
      </Visibility>
      <Visibility visible={status === "waitingForSettlement"}>
        <p className="text-neutral-gray-400 text-sm text-center">
          This market has ended. Final resolution will appear automatically as
          soon as it is available on-chain.
        </p>
      </Visibility>
    </div>
  );
};

export default OutcomeResults;
