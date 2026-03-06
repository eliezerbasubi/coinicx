import { useMemo, useReducer } from "react";
import { Search, Star } from "lucide-react";

import { Asset } from "@/types/trade";
import { useIsMobile } from "@/hooks/useIsMobile";
import Visibility from "@/components/common/Visibility";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTES } from "@/constants/routes";
import { formatPriceToDecimal } from "@/features/trade/utils";
import { useTradeContext } from "@/store/trade/hooks";
import { useInstrumentStore } from "@/store/trade/instrument";
import { cn } from "@/utils/cn";
import { formatNumber } from "@/utils/formatting/numbers";

import Badge from "../Badge";
import TokenImage from "../TokenImage";
import TableHeaderSorter from "./TableHeaderSorter";
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

  const assets = useTickerSelector();

  const { instrumentType, decimals, onAssetChange } = useTradeContext((s) => ({
    instrumentType: s.instrumentType,
    decimals: s.decimals,
    onAssetChange: s.onAssetChange,
  }));

  const [state, dispatch] = useReducer(
    (prev: State, next: Partial<State>) => ({ ...prev, ...next }),
    {
      search: "",
      currentTab: instrumentType,
      sortBy: "volDesc",
      favourites: getFavourites(),
    },
  );

  const isPerps = state.currentTab !== "spot";

  const assetsByTab = useMemo(() => {
    if (state.currentTab === "favourites") {
      return assets.spot
        .concat(assets.perps)
        .filter((ast) => state.favourites.includes(ast.coin));
    }
    if (state.currentTab === "spot") return assets.spot;

    if (state.currentTab === "perps") {
      return assets.perps.filter((ast) => !ast.dex);
    }
    return assets.perps.filter((ast) => ast.dex === state.currentTab);
  }, [state.currentTab, state.favourites, assets]);

  const data = useMemo(() => {
    const query = state.search.toLowerCase();
    let assets = assetsByTab;

    if (query) {
      assets = assetsByTab.filter(
        (ast) =>
          ast.base.toLowerCase().includes(query) ||
          ast.quote.toLowerCase().includes(query),
      );
    }

    return assets.sort((a, b) => {
      switch (state.sortBy) {
        case "volAsc":
          return Number(a.dayNtlVlm) - Number(b.dayNtlVlm);
        case "volDesc":
          return Number(b.dayNtlVlm) - Number(a.dayNtlVlm);
        case "priceAsc":
          return Number(a.midPx) - Number(b.midPx);
        case "priceDesc":
          return Number(b.midPx) - Number(a.midPx);
        case "changeAsc":
          return Number(a.prevDayPx - a.midPx) - Number(b.prevDayPx - b.midPx);
        case "changeDesc":
          return Number(b.prevDayPx - b.midPx) - Number(a.prevDayPx - a.midPx);
        case "openInterestAsc":
          return Number(a.openInterest) - Number(b.openInterest);
        case "openInterestDesc":
          return Number(b.openInterest) - Number(a.openInterest);
        case "fundingAsc":
          return Number(a.funding) - Number(b.funding);
        case "fundingDesc":
          return Number(b.funding) - Number(a.funding);
        case "marketCapAsc":
          return Number(a.marketCap) - Number(b.marketCap);
        case "marketCapDesc":
          return Number(b.marketCap) - Number(a.marketCap);
        case "symbolAsc":
          return a.symbol.localeCompare(b.symbol);
        case "symbolDesc":
          return b.symbol.localeCompare(a.symbol);
        default:
          return Number(b.dayNtlVlm) - Number(a.dayNtlVlm);
      }
    });
  }, [state.search, state.sortBy, assetsByTab]);

  const onAssetSelected = (asset: Asset) => {
    const {
      isSpot,
      base,
      quote,
      coin,
      index,
      perpDexIndex,
      dex,
      midPx,
      markPx,
      szDecimals,
    } = asset;

    const newPath = isSpot
      ? [ROUTES.trade.spot, base, quote]
      : [ROUTES.trade.perps, coin];

    const price = midPx ?? markPx;

    onAssetChange({
      base,
      quote,
      coin,
      instrumentType: isSpot ? "spot" : "perps",
      price,
      szDecimals,
    });

    // Update asset meta and context
    useInstrumentStore.getState().setTokenMetaAndAssetCtx({
      dex: dex ?? "",
      perpDexIndex: perpDexIndex ?? 0,
      assetIndex: index,
      isSpot,
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
          <TabsList
            variant="line"
            className="w-full flex md:block bg-primary-dark px-3"
          >
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="w-fit text-xs font-medium cursor-pointer capitalize py-0.5 first:pl-0 text-neutral-gray-400"
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
                <Visibility visible={isPerps}>
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
                <Visibility visible={isPerps}>
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
                <Visibility visible={!isPerps}>
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
              {data.slice(0, 25).map((datum) => {
                const hasPricing = datum.prevDayPx && datum.markPx;
                const change = hasPricing ? datum.markPx - datum.prevDayPx : 0;
                const changeInPercentage = change
                  ? (change / datum.prevDayPx) * 100
                  : 0;

                const isFavourite = state.favourites.includes(datum.coin);

                return (
                  <tr
                    key={datum.coin}
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
                            toggleFavourite(datum.coin);
                          }}
                        />
                        <Visibility visible={isMobile}>
                          <TokenImage
                            name={datum.base}
                            coin={datum.coin}
                            instrumentType={instrumentType}
                            className="bg-neutral-gray-200 border border-neutral-gray-200 text-trade-dark size-6 md:size-5"
                          />
                        </Visibility>
                        <div className="flex-1">
                          <div className="flex items-center gap-x-1">
                            <p>{datum.symbol}</p>
                            <Visibility visible={datum.isSpot}>
                              <Badge value="SPOT" />
                            </Visibility>

                            <Visibility visible={!!datum.maxLeverage}>
                              <Badge value={`${datum.maxLeverage}x`} />
                            </Visibility>
                            <Visibility visible={!!datum.dex}>
                              <Badge value={datum.dex} />
                            </Visibility>
                          </div>

                          <Visibility visible={isMobile}>
                            <p className="space-x-1 text-[11px] text-neutral-gray-400 font-medium">
                              <span>Vol.</span>
                              <span>
                                {formatNumber(datum.dayNtlVlm, {
                                  style: "currency",
                                  useFallback: true,
                                  // notation: "compact",
                                })}
                              </span>
                            </p>
                          </Visibility>
                        </div>
                      </div>
                    </td>
                    <td className="pr-3 py-0.5 hidden md:table-cell">
                      {formatPriceToDecimal(datum.midPx, decimals)}
                    </td>
                    <td className="pr-3 py-0.5 hidden md:table-cell">
                      <p
                        className={cn("text-buy space-x-1", {
                          "text-sell": change < 0,
                          "text-neutral-gray-300": !hasPricing,
                        })}
                      >
                        <span>
                          {formatPriceToDecimal(change, decimals, {
                            useSign: true,
                          })}
                        </span>
                        <span>/</span>
                        <span>
                          {formatNumber(changeInPercentage / 100, {
                            style: "percent",
                            useFallback: true,
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </p>
                    </td>
                    <Visibility visible={isPerps}>
                      <td className="pr-3 py-0.5 hidden md:table-cell">
                        {formatNumber(Number(datum.funding ?? 0) / 100, {
                          style: "percent",
                          useFallback: true,
                          minimumFractionDigits: 4,
                          maximumFractionDigits: 4,
                        })}
                      </td>
                    </Visibility>
                    <td className="pr-3 py-0.5 hidden md:table-cell">
                      {formatNumber(datum.dayNtlVlm, {
                        style: "currency",
                        useFallback: true,
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <Visibility visible={isPerps}>
                      <td className="pr-3 py-0.5 hidden md:table-cell">
                        {formatNumber(datum.openInterest ?? 0, {
                          style: "currency",
                          useFallback: true,
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </Visibility>
                    <Visibility visible={!isPerps}>
                      <td className="py-0.5 hidden md:table-cell">
                        {formatNumber(datum.marketCap ?? 0, {
                          style: "currency",
                          useFallback: true,
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </Visibility>
                    <Visibility visible={isMobile}>
                      <td className="py-0.5 text-right">
                        <p className="text-white font-semibold">
                          {formatPriceToDecimal(datum.midPx, decimals)}
                        </p>
                        <p
                          className={cn("text-buy space-x-1 text-[11px]", {
                            "text-sell": changeInPercentage < 0,
                            "text-neutral-gray-300": !hasPricing,
                          })}
                        >
                          <span>
                            {formatPriceToDecimal(change, decimals, {
                              useSign: true,
                            })}
                          </span>
                          <span>/</span>
                          <span>
                            {formatNumber(changeInPercentage / 100, {
                              style: "percent",
                              useFallback: true,
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
