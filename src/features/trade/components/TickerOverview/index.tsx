"use client";

import { useDocumentTitle } from "usehooks-ts";

import { useTradeContext } from "@/lib/store/trade/hooks";
import { useShallowInstrumentStore } from "@/lib/store/trade/instrument";
import { cn } from "@/lib/utils/cn";
import { formatPriceToDecimal } from "@/features/trade/utils";

import AssetsSelector from "../AssetsSelector";
import TickerContexts from "./TickerContexts";
import TickerPrice from "./TickerPrice";

type Props = {
  className?: string;
};

const TickerOverview = ({ className }: Props) => {
  const { base, quote, decimals } = useTradeContext((state) => ({
    base: state.base,
    quote: state.quote,
    decimals: state.decimals,
  }));

  const { assetPrice, assetFullName } = useShallowInstrumentStore((s) => ({
    assetPrice: s.assetCtx?.midPx || s.assetCtx?.markPx || 0,
    assetFullName: s.assetMeta?.fullName,
  }));

  useDocumentTitle(
    `${formatPriceToDecimal(assetPrice, decimals)} | ${base} ${quote || ""} ${assetFullName ? `| ${assetFullName} to ${quote}` : ""} - CoinicX`,
  );

  return (
    <div
      className={cn(
        "w-full grid grid-cols-2 md:flex md:items-center md:gap-6 bg-primary-dark p-4 md:rounded-md",
        className,
      )}
    >
      <AssetsSelector className="col-span-2" />

      <TickerPrice />

      <TickerContexts />
    </div>
  );
};

export default TickerOverview;
