import React from "react";

import { cn } from "@/lib/utils/cn";
import AdaptiveDialog from "@/components/ui/adaptive-dialog";
import MarketEventStoreProvider from "@/features/predict/lib/store/market-event/provider";
import { MarketEventMeta } from "@/features/predict/lib/types";

import { useMarketEventContext } from "../lib/store/market-event/hooks";
import MarketEventCtxProvider from "../providers/market-event-ctx-provider";
import TradingWidget from "./TradingWidget";

type Props = {
  open?: boolean;
  trigger?: React.ReactNode;
  marketEventMeta: MarketEventMeta;
  className?: string;
  outcomeIndex?: number;
  onOpenChange?: (open: boolean) => void;
};

/**
 * Trading widget drawer for componenents that are not wrapped with the MarketEventStoreProvider
 */
export const TradingWidgetMarketsDrawer = ({
  trigger,
  className,
  marketEventMeta,
  outcomeIndex,
  open,
  onOpenChange,
}: Props) => {
  return (
    <AdaptiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        <TradingWidgetDrawerTitle
          marketEventTitle={marketEventMeta.title}
          outcomeTitle={
            outcomeIndex !== undefined
              ? marketEventMeta.outcomes[outcomeIndex].title
              : undefined
          }
        />
      }
      trigger={trigger}
      className="gap-1"
    >
      {/* We wrap with MarketEventStoreProvider because trading widget only need few details from the market event */}
      <MarketEventStoreProvider
        marketEventMeta={marketEventMeta}
        categoricalOutcomeIndex={outcomeIndex}
      >
        <MarketEventCtxProvider />
        <TradingWidget
          className={cn(className, "[&>div]:px-0")}
          sideClassName="h-8"
          tabsClassName="px-0"
          showEventTitle={false}
        />
      </MarketEventStoreProvider>
    </AdaptiveDialog>
  );
};

export const TradingWidgetDrawer = () => {
  const { marketEventTitle, outcomeTitle, open, onOpenChange } =
    useMarketEventContext((s) => ({
      marketEventTitle: s.marketEventMeta.title,
      outcomeTitle: s.marketEventMeta.outcomes[s.activeOutcomeIndex]?.title,
      open: s.tradingWidgetDrawerOpen,
      onOpenChange: s.openTradingWidgetDrawer,
    }));

  return (
    <AdaptiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        <TradingWidgetDrawerTitle
          marketEventTitle={marketEventTitle}
          outcomeTitle={outcomeTitle}
        />
      }
      className="gap-1"
    >
      <TradingWidget
        className="[&>div]:px-0"
        sideClassName="h-8"
        tabsClassName="px-0"
        showEventTitle={false}
      />
    </AdaptiveDialog>
  );
};

export const TradingWidgetDrawerTitle = ({
  marketEventTitle,
  outcomeTitle,
}: {
  marketEventTitle: string;
  outcomeTitle?: string;
}) => {
  return (
    <div className="pr-4 space-y-0.5">
      <p
        className={cn("text-sm font-medium text-white line-clamp-2", {
          "text-xs text-neutral-gray-100": outcomeTitle,
        })}
      >
        {marketEventTitle}
      </p>
      {outcomeTitle && <p className="text-xs text-white">{outcomeTitle}</p>}
    </div>
  );
};
