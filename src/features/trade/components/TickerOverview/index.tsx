"use client";

import { useDocumentTitle } from "usehooks-ts";

import { cn } from "@/lib/utils/cn";
import { useTradeContext } from "@/features/trade/store/hooks";
import { formatPriceToDecimal } from "@/features/trade/utils";

import AssetsSelector from "../AssetsSelector";
import TickerContexts from "./TickerContexts";
import TickerPrice from "./TickerPrice";

type Props = {
  className?: string;
};

const TickerOverview = ({ className }: Props) => {
  const { base, quote, pxDecimals, assetPrice, assetFullName } =
    useTradeContext((s) => ({
      base: s.assetMeta.base,
      quote: s.assetMeta.quote,
      pxDecimals: s.assetMeta.pxDecimals,
      assetPrice: s.assetCtx.midPx || s.assetCtx.markPx || 1,
      assetFullName: s.assetMeta.fullName,
    }));

  useDocumentTitle(
    `${formatPriceToDecimal(assetPrice, pxDecimals)} | ${base} ${quote || ""} ${assetFullName ? `| ${assetFullName} to ${quote}` : ""} - CoinicX`,
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
