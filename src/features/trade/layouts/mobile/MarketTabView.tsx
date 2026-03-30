import {
  Activity,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { ChevronRight, Search } from "lucide-react";
import { useWebHaptics } from "web-haptics/react";

import { useFavouriteStore } from "@/lib/store/trade/favourites";
import { usePreferencesStore } from "@/lib/store/trade/user-preferences";
import { Asset } from "@/lib/types/trade";
import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import TokenImage from "@/components/common/TokenImage";
import Visibility from "@/components/common/Visibility";
import { Button } from "@/components/ui/button";
import Tag from "@/components/ui/tag";
import AssetsSelectorDataTable from "@/features/trade/components/AssetsSelector/AssetsSelectorDataTable";
import AssetsSelectorTabs from "@/features/trade/components/AssetsSelector/AssetsSelectorTabs";
import { useAssetsAndContexts } from "@/features/trade/hooks/useAssetAndContexts";
import { useSelectToken } from "@/features/trade/hooks/useSelectToken";
import { formatPriceToDecimal, getPriceDecimals } from "@/features/trade/utils";
import {
  computeTrendingPerps,
  computeTrendingSpot,
} from "@/features/trade/utils/computeTrending";

type State = {
  openSearch: boolean;
  currentTab: string;
};

const MarketTabView = () => {
  const assets = useAssetsAndContexts();
  const favourites = useFavouriteStore((s) => s.favourites);
  const haptic = useWebHaptics();

  const { selectTokenFromAssetInfo } = useSelectToken();

  const [state, dispatch] = useReducer(
    (prev: State, next: Partial<State>) => ({ ...prev, ...next }),
    {
      openSearch: false,
      currentTab: "perps",
    },
  );

  const isPerps = state.currentTab !== "spot";

  const data = useMemo(() => {
    if (state.currentTab === "favourites") {
      return assets.spot
        .concat(assets.perps)
        .filter((ast) => favourites.includes(ast.coin));
    }
    if (state.currentTab === "spot") return assets.spot;

    if (state.currentTab === "perps") {
      return assets.perps.filter((ast) => !ast.dex);
    }
    return assets.perps.filter((ast) => ast.dex === state.currentTab);
  }, [state.currentTab, favourites, assets]);

  const onAssetSelected = (asset: Asset) => {
    selectTokenFromAssetInfo(asset);

    usePreferencesStore.getState().dispatch({ mobileViewTab: "trade" });
  };

  return (
    <div className="w-full">
      <div className="px-2 pt-4 standalone:pt-safe-top sticky top-0 z-10 bg-primary-dark">
        <div
          role="button"
          onClick={() => {
            dispatch({ openSearch: true });
            haptic.trigger("medium");
          }}
          className="w-full flex items-center h-8 px-2 rounded-lg border border-neutral-gray-200 hover:border-primary active:scale-95 transition-transform"
        >
          <Search className="text-gray-600 size-4" />
          <p className="text-neutral-gray-400 text-sm pl-2">Search</p>
        </div>
      </div>
      <div className="w-full mb-20">
        <AssetsSelectorTabs
          value={state.currentTab}
          onValueChange={(value) => dispatch({ currentTab: value })}
          className="sticky top-12 standalone:top-[calc(env(safe-area-inset-top)+32px)] z-10 bg-primary-dark pb-2"
        />

        <div className="px-2">
          <AssetsSelectorDataTable
            isPerps={isPerps}
            data={data}
            pageSize={40}
            headerClassName="sticky top-[100px] standalone:top-[calc(env(safe-area-inset-top)+84px)] z-10 bg-primary-dark"
            onAssetSelected={onAssetSelected}
          />
        </div>
      </div>

      <Activity mode={state.openSearch ? "visible" : "hidden"}>
        <SearchOverlay
          onOpenChange={(open) => dispatch({ openSearch: open })}
        />
      </Activity>
    </div>
  );
};

type SearchOverlayProps = {
  onOpenChange?: (open?: boolean) => void;
};

const SearchOverlay = ({ onOpenChange }: SearchOverlayProps) => {
  const [search, setSearch] = useState("");
  const assets = useAssetsAndContexts();

  const inputRef = useRef<HTMLInputElement>(null);

  const { selectTokenFromAssetInfo } = useSelectToken();

  const data = useMemo(() => {
    const query = search.toLowerCase();

    if (!query) return { spot: [], perps: [] };

    return {
      spot: assets.spot.filter(
        (ast) =>
          ast.base.toLowerCase().includes(query) ||
          ast.quote.toLowerCase().includes(query),
      ),
      perps: assets.perps.filter(
        (ast) =>
          ast.base.toLowerCase().includes(query) ||
          ast.quote.toLowerCase().includes(query),
      ),
    };
  }, [search, assets]);

  const onCancel = () => {
    setSearch("");
    onOpenChange?.(false);
  };

  const onAssetSelected = (asset: Asset) => {
    selectTokenFromAssetInfo(asset);

    usePreferencesStore.getState().dispatch({ mobileViewTab: "trade" });
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-20 bg-primary-dark overflow-y-auto">
      <div className="w-full flex items-center gap-4 px-3 pt-4 standalone:pt-safe-top sticky top-0 z-10 bg-primary-dark">
        <div className="w-full flex items-center h-8 px-2 rounded-lg border border-neutral-gray-200 hover:border-primary focus-within:border-primary">
          <Search className="text-gray-600 size-4" />
          <input
            ref={inputRef}
            type="search"
            name="search"
            id="search"
            placeholder="Search"
            autoComplete="off"
            autoCorrect="off"
            autoFocus
            className="size-full text-sm outline-none caret-primary pl-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          variant="ghost"
          className="size-fit p-0 text-white"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>

      <Visibility visible={!!search}>
        <div className="w-full space-y-4 p-3">
          <ResultListView
            data={data.spot}
            title="Spot"
            onAssetSelected={onAssetSelected}
          />
          <ResultListView
            data={data.perps}
            title="Perps"
            onAssetSelected={onAssetSelected}
          />
        </div>
      </Visibility>

      <Visibility visible={!search}>
        <TrendingView
          spot={assets.spot}
          perps={assets.perps}
          onAssetSelected={onAssetSelected}
        />
      </Visibility>
    </div>
  );
};

const TrendingView = ({
  onAssetSelected,
  spot,
  perps,
}: {
  onAssetSelected?: (asset: Asset) => void;
  spot: Asset[];
  perps: Asset[];
}) => {
  const trending = useMemo(
    () => ({
      spot: computeTrendingSpot(spot, 5),
      perps: computeTrendingPerps(perps, 5),
    }),
    [spot, perps],
  );

  return (
    <div className="w-full space-y-4 p-3">
      <TrendingListView
        data={trending.spot}
        title="Trending Spot"
        onAssetSelected={onAssetSelected}
      />
      <TrendingListView
        data={trending.perps}
        title="Trending Perps"
        onAssetSelected={onAssetSelected}
      />
    </div>
  );
};

const TrendingListView = ({
  data,
  title,
  onAssetSelected,
}: {
  data: Asset[];
  title: string;
  onAssetSelected?: (asset: Asset) => void;
}) => {
  return (
    <div className="w-full">
      <p className="text-white font-medium text-sm mb-2">{title}</p>

      <div className="bg-neutral-gray-600 rounded-xl p-2 space-y-3">
        {data.map((asset) => {
          const change = asset.markPx - asset.prevDayPx;
          const changeInPercentage = asset.prevDayPx
            ? (change / asset.prevDayPx) * 100
            : 0;

          const pxDecimals = getPriceDecimals(
            asset.midPx,
            asset.szDecimals,
            asset.isSpot,
          );

          return (
            <div
              key={asset.base + asset.coin + asset.index}
              role="button"
              tabIndex={0}
              className="w-full flex items-center gap-2"
              onClick={() => onAssetSelected?.(asset)}
            >
              <TokenImage
                key={asset.base + asset.coin + asset.index}
                name={asset.base}
                coin={asset.coin}
                instrumentType={asset.isSpot ? "spot" : "perps"}
              />
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <div className="text-white font-medium text-sm flex items-center gap-2">
                    <span>{asset.base}</span>
                    {asset.dex && <Tag value={asset.dex} />}
                    {asset.maxLeverage && (
                      <Tag value={`${asset.maxLeverage}x`} />
                    )}
                  </div>
                  <p className="text-neutral-gray-400 text-xs space-x-1">
                    <span>
                      {formatNumber(
                        asset.isSpot
                          ? Number(asset.marketCap ?? 0)
                          : asset.dayNtlVlm,
                        {
                          style: "currency",
                          useFallback: true,
                          notation: "compact",
                        },
                      )}
                    </span>
                    <span>{asset.isSpot ? "Cap" : "Vol"}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium text-sm">
                    {formatPriceToDecimal(asset.midPx, pxDecimals, {
                      style: "currency",
                      useFallback: true,
                    })}
                  </p>
                  <p
                    className={cn("text-neutral-gray-400 text-xs", {
                      "text-buy": changeInPercentage > 0,
                      "text-sell": changeInPercentage < 0,
                    })}
                  >
                    {formatNumber(changeInPercentage / 100, {
                      style: "percent",
                      useSign: true,
                      useFallback: true,
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ResultListView = ({
  data,
  title,
  onAssetSelected,
}: {
  data: Asset[];
  title: string;
  onAssetSelected?: (asset: Asset) => void;
}) => {
  const [showMore, setShowMore] = useState(false);

  if (data.length === 0) return null;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <p className="text-white font-medium text-sm mb-2">{title}</p>

        <Visibility visible={data.length > 3}>
          <Button
            variant="ghost"
            className="size-fit text-xs p-0 text-neutral-gray-400"
            onClick={() => setShowMore((prev) => !prev)}
          >
            {showMore ? "Show Less" : "Show More"}
          </Button>
        </Visibility>
      </div>

      <div className="space-y-2">
        {data.slice(0, showMore ? data.length : 3).map((asset) => {
          const change = asset.markPx - asset.prevDayPx;
          const changeInPercentage = asset.prevDayPx
            ? (change / asset.prevDayPx) * 100
            : 0;

          return (
            <div
              role="button"
              tabIndex={0}
              key={asset.base + asset.coin + asset.index}
              className="w-full flex items-center gap-2 active:scale-95 transition-transform"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onAssetSelected?.(asset);
                }
              }}
              onClick={() => onAssetSelected?.(asset)}
            >
              <TokenImage
                key={asset.base + asset.coin + asset.index}
                name={asset.base}
                coin={asset.coin}
                instrumentType={asset.isSpot ? "spot" : "perps"}
                className="size-4"
              />
              <div className="flex-1 flex items-center justify-between">
                <div className="text-white font-medium text-sm flex items-center gap-2">
                  <span>{asset.symbol}</span>
                  {asset.dex && (
                    <Tag value={asset.dex} className="text-2xs md:text-3xs" />
                  )}
                  {asset.maxLeverage && (
                    <Tag
                      value={`${asset.maxLeverage}x`}
                      className="text-2xs md:text-3xs"
                    />
                  )}
                </div>
                <div className="text-right">
                  <p className="text-white font-medium text-xs">
                    {formatNumber(asset.midPx)}
                  </p>
                  <p
                    className={cn("text-neutral-gray-400 text-3xs", {
                      "text-buy": changeInPercentage > 0,
                      "text-sell": changeInPercentage < 0,
                    })}
                  >
                    {formatNumber(changeInPercentage / 100, {
                      style: "percent",
                      useSign: true,
                      useFallback: true,
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
              <ChevronRight className="text-neutral-gray-400 size-4" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MarketTabView;
