import { Activity, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import { useTradeContext } from "@/lib/store/trade/hooks";
import { useShallowInstrumentStore } from "@/lib/store/trade/instrument";
import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import { useIsMobile } from "@/hooks/useIsMobile";
import TokenImage from "@/components/common/TokenImage";
import Visibility from "@/components/common/Visibility";
import AdaptivePopover from "@/components/ui/adaptive-popover";
import Tag from "@/components/ui/tag";
import { formatSymbol } from "@/features/trade/utils";

import TickerSelectorProvider from "../TickerOverview/TickerSelectorProvider";
import AssetsSelectorContent from "./AssetsSelectorContent";

type Props = {
  className?: string;
  showPriceChangePercentage?: boolean;
  showTags?: boolean;
  showTokenImage?: boolean;
  symbolClassName?: string;
};

const AssetsSelector = ({
  className,
  showPriceChangePercentage,
  showTags,
  showTokenImage = true,
  symbolClassName,
}: Props) => {
  const [open, setOpen] = useState(false);

  const isMobile = useIsMobile();

  const tokenMeta = useShallowInstrumentStore((s) => ({
    dex: s.assetMeta?.dex,
    maxLeverage: s.assetMeta?.maxLeverage,
    coin: s.assetMeta?.coin,
  }));

  const { base, quote, coin, instrumentType } = useTradeContext((s) => ({
    base: s.base,
    quote: s.quote,
    coin: s.coin,
    instrumentType: s.instrumentType,
  }));

  const triggerRef = useRef(null);

  const isSpot = instrumentType === "spot";

  return (
    <div className={cn("block mb-1 sm:mb-0", className)}>
      <div
        role="button"
        tabIndex={0}
        ref={triggerRef}
        className="group/selector flex items-center space-x-2 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <Visibility visible={showTokenImage}>
          <TokenImage
            key={`${base}-${coin}`}
            name={base}
            coin={coin}
            instrumentType={instrumentType}
            className="size-5 md:size-8"
          />
        </Visibility>

        <div className="flex-1 flex items-center md:block gap-1">
          <div className="flex items-center space-x-1">
            <p
              className={cn(
                "text-md md:text-xl font-bold whitespace-nowrap",
                symbolClassName,
              )}
            >
              {formatSymbol(base, quote, isSpot)}
            </p>

            <ChevronDown
              strokeWidth={2.5}
              className="self-center md:self-start text-white transition-transform group-data-[state=open]/selector:rotate-180 md:mt-0.5 size-4 md:size-6"
            />
          </div>
          <Visibility visible={showTags}>
            <div className="flex items-center space-x-1">
              <Tag value={instrumentType} className="capitalize" />
              {!!tokenMeta?.maxLeverage && (
                <Tag value={`${tokenMeta?.maxLeverage}x`} />
              )}
              {tokenMeta.dex && <Tag value={tokenMeta?.dex} />}
            </div>
          </Visibility>
          <Visibility visible={isMobile && !!showPriceChangePercentage}>
            <PriceChangePercentageTag />
          </Visibility>
        </div>
      </div>

      <Activity mode={open ? "visible" : "hidden"}>
        <TickerSelectorProvider>
          <AdaptivePopover
            open={open}
            triggerRef={triggerRef}
            collisionPadding={4}
            onOpenChange={setOpen}
            className="w-full h-full lg:w-3xl p-0 md:pt-4 md:px-4 pb-0 md:mt-4"
          >
            <AssetsSelectorContent onSelect={() => setOpen(false)} />
          </AdaptivePopover>
        </TickerSelectorProvider>
      </Activity>
    </div>
  );
};

const PriceChangePercentageTag = () => {
  const { markPx, prevDayPx } = useShallowInstrumentStore((s) => ({
    markPx: s.assetCtx?.markPx ?? 0,
    prevDayPx: s.assetCtx?.prevDayPx ?? 0,
  }));

  const change = markPx - prevDayPx;
  const changeInPercentage = prevDayPx ? (change / prevDayPx) * 100 : 0;

  return (
    <Tag
      value={formatNumber(changeInPercentage / 100, {
        style: "percent",
        useFallback: true,
        useSign: true,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
      className={cn("h-fit bg-buy/10 text-buy", {
        "bg-sell/10 text-sell": change < 0,
      })}
    />
  );
};

export default AssetsSelector;
