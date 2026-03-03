import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import { useIsMobile } from "@/hooks/useIsMobile";
import Visibility from "@/components/common/Visibility";
import AdaptivePopover from "@/components/ui/adaptive-popover";
import { formatSymbol } from "@/features/trade/utils";
import { useTradeContext } from "@/store/trade/hooks";
import { useShallowInstrumentStore } from "@/store/trade/instrument";

import Badge from "../Badge";
import TokenImage from "../TokenImage";
import AssetsSelectorContent from "./AssetsSelectorContent";
import TickerSelectorProvider from "./TickerSelectorProvider";

const AssetsSelector = () => {
  const [open, setOpen] = useState(false);

  const isMobile = useIsMobile();

  const tokenMeta = useShallowInstrumentStore((s) => ({
    dex: s.assetMeta?.dex,
    maxLeverage: s.assetMeta?.maxLeverage,
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
        className="group/selector flex items-center space-x-2 cursor-pointer mb-2 sm:mb-0"
        onClick={() => setOpen(!open)}
      >
        <TokenImage
          key={`${base}-${coin}`}
          name={base}
          coin={coin}
          instrumentType={instrumentType}
          className="size-5 md:size-8"
        />

        <div className="flex-1">
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
              <Badge value={instrumentType} className="capitalize" />
              {!!tokenMeta?.maxLeverage && (
                <Badge value={`${tokenMeta?.maxLeverage}x`} />
              )}
              <Badge value={tokenMeta?.dex} />
            </div>
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

export default AssetsSelector;
