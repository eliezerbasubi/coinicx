import React, { useMemo, useReducer } from "react";
import { ChevronDown, ChevronUp, Search, Star } from "lucide-react";

import { MetaAndAssetCtx } from "@/types/trade";
import { useIsMobile } from "@/hooks/useIsMobile";
import Visibility from "@/components/common/Visibility";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTES } from "@/constants/routes";
import { useTradeContext } from "@/store/trade/hooks";
import { useInstrumentStore } from "@/store/trade/instrument";
import { cn } from "@/utils/cn";
import { formatNumberWithFallback } from "@/utils/formatting/numbers";

import Badge from "../Badge";
import TokenImage from "../TokenImage";
import { useTickerSelector } from "./TickerSelectorProvider";

type State = {
  search: string;
  currentTab: string;
  sortBy: string;
  favourites: string[];
};

const TABS = [
  { value: "favourites", label: "Favourites" },
  { value: "perps", label: "Perps" },
  { value: "spot", label: "Spot" },
  { value: "xyz", label: "Tradfi" },
  { value: "flx", label: "Felix Exchange" },
  { value: "vntls", label: "Ventuals" },
  { value: "hyna", label: "HyENA" },
];

const FAVOURITES_KEY = "FAVOURITES_SYMBOLS";

const getFavourites = (): Array<string> => {
  const favourites = localStorage.getItem(FAVOURITES_KEY);
  return favourites ? JSON.parse(favourites) : [];
};

const AssetsSelectorContent = ({ onSelect }: { onSelect?: () => void }) => {
  const isMobile = useIsMobile();
  const metaAndAssetCtxs = useTickerSelector();
  const instrumentType = useTradeContext((s) => s.instrumentType);

  const onAssetChange = useTradeContext((s) => s.onAssetChange);

  const [state, dispatch] = useReducer(
    (prev: State, next: Partial<State>) => ({ ...prev, ...next }),
    {
      search: "",
      currentTab: instrumentType,
      sortBy: "volDesc",
      favourites: getFavourites(),
    },
  );

  const isPerpsInstrument = state.currentTab !== "spot";

  const assetsByTab = useMemo(() => {
    if (state.currentTab === "favourites") {
      const assets = metaAndAssetCtxs.spot
        .concat(metaAndAssetCtxs.perps)
        .filter((ast) => state.favourites.includes(ast.meta.coin));
      return assets;
    }
    if (state.currentTab === "spot") return metaAndAssetCtxs.spot;

    if (state.currentTab === "perps")
      return metaAndAssetCtxs.perps.filter((ast) => !ast.meta.dex);
    return metaAndAssetCtxs.perps.filter(
      (ast) => ast.meta.dex === state.currentTab,
    );
  }, [state.currentTab, state.favourites, metaAndAssetCtxs]);

  const data = useMemo(() => {
    const query = state.search.toLowerCase();
    let assets = assetsByTab;

    if (query) {
      assets = assetsByTab.filter(
        (ast) =>
          ast.meta.base.toLowerCase().includes(query) ||
          ast.meta.quote.toLowerCase().includes(query),
      );
    }

    return assets.sort((a, b) => {
      switch (state.sortBy) {
        case "volAsc":
          return Number(a.ctx.dayNtlVlm) - Number(b.ctx.dayNtlVlm);
        case "volDesc":
          return Number(b.ctx.dayNtlVlm) - Number(a.ctx.dayNtlVlm);
        case "priceAsc":
          return Number(a.ctx.midPx) - Number(b.ctx.midPx);
        case "priceDesc":
          return Number(b.ctx.midPx) - Number(a.ctx.midPx);
        case "changeAsc":
          return (
            Number(a.ctx.prevDayPx - a.ctx.midPx) -
            Number(b.ctx.prevDayPx - b.ctx.midPx)
          );
        case "changeDesc":
          return (
            Number(b.ctx.prevDayPx - b.ctx.midPx) -
            Number(a.ctx.prevDayPx - a.ctx.midPx)
          );
        case "openInterestAsc":
          return Number(a.ctx.openInterest) - Number(b.ctx.openInterest);
        case "openInterestDesc":
          return Number(b.ctx.openInterest) - Number(a.ctx.openInterest);
        case "fundingAsc":
          return Number(a.ctx.funding) - Number(b.ctx.funding);
        case "fundingDesc":
          return Number(b.ctx.funding) - Number(a.ctx.funding);
        case "marketCapAsc":
          return Number(a.ctx.marketCap) - Number(b.ctx.marketCap);
        case "marketCapDesc":
          return Number(b.ctx.marketCap) - Number(a.ctx.marketCap);
        case "symbolAsc":
          return a.meta.symbol.localeCompare(b.meta.symbol);
        case "symbolDesc":
          return b.meta.symbol.localeCompare(a.meta.symbol);
        default:
          return Number(b.ctx.dayNtlVlm) - Number(a.ctx.dayNtlVlm);
      }
    });
  }, [state.search, state.sortBy, assetsByTab]);

  const formatValue = (
    value: number,
    options?: Intl.NumberFormatOptions & {
      szDecimals?: number;
      maxDecimals?: number;
    },
  ) => {
    const { szDecimals, ...intlOptions } = options ?? {};

    return formatNumberWithFallback(value, {
      ...intlOptions,
      maximumSignificantDigits: szDecimals,
    });
  };

  const onAssetSelected = (metaAndAssetCtx: MetaAndAssetCtx) => {
    const { isSpot, meta, ctx } = metaAndAssetCtx;
    const newPath = isSpot
      ? [ROUTES.trade.spot, meta.base, meta.quote]
      : [ROUTES.trade.perps, meta.coin];

    onAssetChange({
      base: meta.base,
      quote: meta.quote,
      instrumentType: isSpot ? "spot" : "perps",
    });
    useInstrumentStore.setState({
      assetMeta: meta,
      assetCtx: ctx,
    });

    onSelect?.();

    window.history.replaceState({}, "", newPath.join("/"));
  };

  const onSorterChange = (value: string) => dispatch({ sortBy: value });

  const toggleFavourite = (symbol: string) => {
    const favourites = getFavourites();
    const newFavourites = favourites.includes(symbol)
      ? favourites.filter((favourite) => favourite !== symbol)
      : [...favourites, symbol];
    localStorage.setItem(FAVOURITES_KEY, JSON.stringify(newFavourites));
    dispatch({ favourites: newFavourites });
  };

  return (
    <div className="size-full">
      <div className="w-full px-3 md:px-0 mt-2 md:mt-0">
        <div className="w-full flex items-center h-8 px-2 mb-2 rounded-lg border border-neutral-gray-200 hover:border-primary">
          <Search className="text-gray-600 size-4" />
          <input
            type="search"
            name="search"
            id="search"
            placeholder="Search"
            className="size-full text-sm outline-none caret-primary pl-2"
            value={state.search}
            onChange={(e) => dispatch({ search: e.target.value })}
          />
        </div>
      </div>
      <div className="size-full">
        <Tabs
          value={state.currentTab}
          onValueChange={(value) => dispatch({ currentTab: value })}
          className="w-full mb-4"
        >
          <TabsList className="w-full flex md:block bg-primary-dark px-3 pb-0 md:p-0 border-b border-neutral-gray-200 rounded-none overflow-x-auto no-scrollbars">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="w-fit border-0 rounded-none text-xs font-medium cursor-pointer capitalize py-0.5 first:pl-0 text-neutral-gray-400 data-[state=active]:text-white data-[state=active]:border-b border-primary"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="size-full md:min-h-64 md:max-h-64 overflow-y-auto pb-2 px-3 md:px-0">
          <table className="w-full text-xs font-medium">
            <thead className="w-full bg-primary-dark sticky top-0">
              <tr className="text-neutral-gray-400">
                <td className="pb-1 pr-4">
                  <div className="flex items-center space-x-1">
                    <TableHeaderSorter
                      id="symbol"
                      sorter={state.sortBy}
                      onClick={onSorterChange}
                    >
                      Symbol
                    </TableHeaderSorter>
                    <Visibility visible={isMobile}>
                      <TableHeaderSorter
                        id="vol"
                        sorter={state.sortBy}
                        onClick={onSorterChange}
                      >
                        <span>/</span>
                        <p>Vol</p>
                      </TableHeaderSorter>
                    </Visibility>
                  </div>
                </td>
                <td className="pb-1 pr-4 hidden md:table-cell">
                  <TableHeaderSorter
                    id="price"
                    sorter={state.sortBy}
                    onClick={onSorterChange}
                  >
                    Last Price
                  </TableHeaderSorter>
                </td>
                <td className="pb-1 pr-4 hidden md:table-cell">
                  <TableHeaderSorter
                    id="change"
                    sorter={state.sortBy}
                    onClick={onSorterChange}
                  >
                    24h Change
                  </TableHeaderSorter>
                </td>
                <Visibility visible={isPerpsInstrument}>
                  <td className="pb-1 pr-4 hidden md:table-cell">
                    <TableHeaderSorter
                      id="funding"
                      sorter={state.sortBy}
                      onClick={onSorterChange}
                    >
                      8h Funding
                    </TableHeaderSorter>
                  </td>
                </Visibility>
                <td className="pb-1 pr-4 hidden md:table-cell">
                  <TableHeaderSorter
                    id="vol"
                    sorter={state.sortBy}
                    onClick={onSorterChange}
                  >
                    Volume
                  </TableHeaderSorter>
                </td>
                <Visibility visible={isPerpsInstrument}>
                  <td className="pb-1 pr-4 hidden md:table-cell">
                    <TableHeaderSorter
                      id="openInterest"
                      sorter={state.sortBy}
                      onClick={onSorterChange}
                    >
                      Open Interest
                    </TableHeaderSorter>
                  </td>
                </Visibility>
                <Visibility visible={!isPerpsInstrument}>
                  <td className="pb-1 hidden md:table-cell">
                    <TableHeaderSorter
                      id="marketCap"
                      sorter={state.sortBy}
                      onClick={onSorterChange}
                    >
                      Market Cap
                    </TableHeaderSorter>
                  </td>
                </Visibility>
                <Visibility visible={isMobile}>
                  <td className="pb-1">
                    <div className="flex items-center justify-end space-x-1">
                      <TableHeaderSorter
                        id="price"
                        sorter={state.sortBy}
                        onClick={onSorterChange}
                      >
                        Price
                      </TableHeaderSorter>
                      <span>/</span>
                      <TableHeaderSorter
                        id="change"
                        sorter={state.sortBy}
                        onClick={onSorterChange}
                      >
                        24H Change
                      </TableHeaderSorter>
                    </div>
                  </td>
                </Visibility>
              </tr>
            </thead>
            <tbody className="w-full">
              {data.slice(0, 50).map((datum) => {
                const { meta, ctx, isSpot } = datum;

                const szDecimals = meta.szDecimals;

                const hasPricing = ctx.prevDayPx && ctx.midPx;
                const change = hasPricing ? ctx.prevDayPx - ctx.midPx : 0;
                const changeInPercentage = change
                  ? (change / ctx.midPx) * 100
                  : 0;
                const isFavourite = state.favourites.includes(meta.coin);

                return (
                  <tr
                    key={meta.coin}
                    className={cn(
                      "text-white hover:bg-neutral-gray-200 cursor-pointer",
                      {
                        "text-neutral-gray-300": !hasPricing,
                      },
                    )}
                    onClick={() => onAssetSelected(datum)}
                  >
                    <td className="pr-3 py-0.5">
                      <div className="flex items-center gap-x-2 md:gap-x-1">
                        <Star
                          role="button"
                          className={cn("size-3 text-neutral-gray-400", {
                            "fill-primary text-primary": isFavourite,
                          })}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavourite(meta.coin);
                          }}
                        />
                        <Visibility visible={isMobile}>
                          <TokenImage
                            name={meta.base}
                            instrumentType={instrumentType}
                            className="bg-neutral-gray-200 border border-neutral-gray-200 text-trade-dark size-6 md:size-5"
                          />
                        </Visibility>
                        <div className="flex-1">
                          <div className="flex items-center gap-x-1">
                            <p>{meta.symbol}</p>
                            <Visibility visible={isSpot}>
                              <Badge value="SPOT" />
                            </Visibility>

                            <Visibility visible={!!meta.maxLeverage}>
                              <Badge value={`${meta.maxLeverage}x`} />
                            </Visibility>
                            <Visibility visible={!!meta.dex}>
                              <Badge value={meta.dex} />
                            </Visibility>
                          </div>

                          <Visibility visible={isMobile}>
                            <p className="space-x-1 text-[11px] text-neutral-gray-400 font-medium">
                              <span>Vol.</span>
                              <span>
                                {formatValue(ctx.dayNtlVlm, {
                                  style: "currency",
                                  // notation: "compact",
                                })}
                              </span>
                            </p>
                          </Visibility>
                        </div>
                      </div>
                    </td>
                    <td className="pr-3 py-0.5 hidden md:table-cell">
                      {formatValue(ctx.midPx, { szDecimals })}
                    </td>
                    <td className="pr-3 py-0.5 hidden md:table-cell">
                      <p
                        className={cn("text-buy space-x-1", {
                          "text-sell": changeInPercentage < 0,
                          "text-neutral-gray-300": !hasPricing,
                        })}
                      >
                        <span>
                          {change >= 0 && "+"}
                          {formatValue(change, { szDecimals })}
                        </span>
                        <span>/</span>
                        <span>
                          {formatValue(changeInPercentage, {
                            style: "percent",
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </p>
                    </td>
                    <Visibility visible={isPerpsInstrument}>
                      <td className="pr-3 py-0.5 hidden md:table-cell">
                        {formatValue(ctx.funding ?? 0, {
                          style: "percent",
                          minimumFractionDigits: 4,
                          maximumFractionDigits: 4,
                        })}
                      </td>
                    </Visibility>
                    <td className="pr-3 py-0.5 hidden md:table-cell">
                      {formatValue(ctx.dayNtlVlm, { style: "currency" })}
                    </td>
                    <Visibility visible={isPerpsInstrument}>
                      <td className="pr-3 py-0.5 hidden md:table-cell">
                        {formatValue(ctx.openInterest ?? 0, {
                          style: "currency",
                        })}
                      </td>
                    </Visibility>
                    <Visibility visible={!isPerpsInstrument}>
                      <td className="py-0.5 hidden md:table-cell">
                        {formatValue(ctx.marketCap ?? 0, {
                          style: "currency",
                        })}
                      </td>
                    </Visibility>
                    <Visibility visible={isMobile}>
                      <td className="py-0.5 text-right">
                        <p className="text-white font-semibold">
                          {formatValue(ctx.midPx, { szDecimals })}
                        </p>
                        <p
                          className={cn("text-buy space-x-1 text-[11px]", {
                            "text-sell": changeInPercentage < 0,
                            "text-neutral-gray-300": !hasPricing,
                          })}
                        >
                          <span>
                            {change >= 0 && "+"}
                            {formatValue(change, { szDecimals })}
                          </span>
                          <span>/</span>
                          <span>
                            {formatValue(changeInPercentage, {
                              style: "percent",
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </p>
                      </td>
                    </Visibility>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssetsSelectorContent;

type TableHeaderSorterProps = {
  children: React.ReactNode;
  sorter?: string;
  id: string;
  onClick?: (value: string) => void;
};

const TableHeaderSorter = ({
  children,
  sorter,
  id,
  onClick,
}: TableHeaderSorterProps) => {
  const ascKey = id + "Asc";
  const descKey = id + "Desc";

  const onSort = () => {
    const value = sorter ? (sorter === ascKey ? descKey : ascKey) : descKey;

    onClick?.(value);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className="flex items-center gap-x-1"
      onClick={onSort}
    >
      {children}
      <div className="flex flex-col items-center justify-center -space-y-1.5">
        <ChevronUp
          className={cn("size-3", { "text-primary": sorter === ascKey })}
        />
        <ChevronDown
          className={cn("size-3", { "text-primary": sorter === descKey })}
        />
      </div>
    </div>
  );
};
