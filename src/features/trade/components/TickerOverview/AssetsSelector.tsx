import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ChevronDown } from "lucide-react";

import { useTradeContext } from "@/lib/store/trade/hooks";
import { useShallowInstrumentStore } from "@/lib/store/trade/instrument";
import { useShallowPreferencesStore } from "@/lib/store/trade/user-preferences";
import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import { useIsMobile } from "@/hooks/useIsMobile";
import Visibility from "@/components/common/Visibility";
import AdaptivePopover from "@/components/ui/adaptive-popover";
import Tag from "@/components/ui/tag";
import { formatSymbol } from "@/features/trade/utils";

import TokenImage from "../TokenImage";
import AssetsSelectorContent from "./AssetsSelectorContent";
import TickerSelectorProvider from "./TickerSelectorProvider";

const FavoriteButton = dynamic(() => import("./FavoriteButton"), {
  ssr: false,
});

type Props = {
  className?: string;
};

const AssetsSelector = ({ className }: Props) => {
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
    <>
      <div
        role="button"
        tabIndex={0}
        ref={triggerRef}
        className={cn(
          "group/selector flex items-center space-x-2 cursor-pointer mb-1 sm:mb-0",
          className,
        )}
        onClick={() => setOpen(!open)}
      >
        <TokenImage
          key={`${base}-${coin}`}
          name={base}
          coin={coin}
          instrumentType={instrumentType}
          className="size-5 md:size-8"
        />

        <div className="flex-1 flex items-center">
          <div className="flex-1">
            <div className="flex items-center md:block gap-1">
              <div className="flex items-center space-x-1">
                <p className="text-md md:text-xl font-bold whitespace-nowrap">
                  {formatSymbol(base, quote, isSpot)}
                </p>

                <ChevronDown
                  strokeWidth={2.5}
                  className="self-center md:self-start text-white transition-transform group-data-[state=open]/selector:rotate-180 md:mt-0.5 size-4 md:size-6"
                />
              </div>
              <Visibility visible={!isMobile}>
                <div className="flex items-center space-x-1">
                  <Tag value={instrumentType} className="capitalize" />
                  {!!tokenMeta?.maxLeverage && (
                    <Tag value={`${tokenMeta?.maxLeverage}x`} />
                  )}
                  {tokenMeta.dex && <Tag value={tokenMeta?.dex} />}
                </div>
              </Visibility>
              <Visibility visible={isMobile}>
                <PriceChangePercentageTag />
              </Visibility>
            </div>
          </div>

          <Visibility visible={isMobile}>
            {tokenMeta?.coin && (
              <FavoriteButton coin={tokenMeta.coin} className="size-4" />
            )}
          </Visibility>
        </div>
      </div>
      <TickerSelectorProvider>
        <AdaptivePopover
          open={open}
          triggerRef={triggerRef}
          onOpenChange={setOpen}
          className="w-full h-full lg:w-3xl pb-0"
        >
          <AssetsSelectorContent onSelect={() => setOpen(false)} />
        </AdaptivePopover>
      </TickerSelectorProvider>
    </>
  );
};

const PriceChangePercentageTag = () => {
  const mobileViewTab = useShallowPreferencesStore((s) => s.mobileViewTab);

  const { markPx, prevDayPx } = useShallowInstrumentStore((s) => ({
    markPx: s.assetCtx?.markPx ?? 0,
    prevDayPx: s.assetCtx?.prevDayPx ?? 0,
  }));

  const change = markPx - prevDayPx;
  const changeInPercentage = prevDayPx ? (change / prevDayPx) * 100 : 0;

  if (mobileViewTab !== "trade") return null;

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
