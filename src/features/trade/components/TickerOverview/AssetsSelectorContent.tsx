import { useMemo, useReducer } from "react";
import { Search } from "lucide-react";

import { useTradeContext } from "@/lib/store/trade/hooks";
import { Asset } from "@/lib/types/trade";
import { useIsMobile } from "@/hooks/useIsMobile";
import { DataTable } from "@/components/ui/datatable";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSelectToken } from "@/features/trade/hooks/useSelectToken";

import { ASSETS_SELECTOR_COLUMNS } from "./Columns";
import { useFavoriteStore } from "./store";
import { useTickerSelector } from "./TickerSelectorProvider";

type State = {
  search: string;
  currentTab: string;
};

const TABS = [
  { value: "favourites", label: "Favourites" },
  { value: "perps", label: "Perps" },
  { value: "spot", label: "Spot" },
  { value: "xyz", label: "Tradfi" },
  { value: "flx", label: "Felix Exchange" },
  { value: "vntl", label: "Ventuals" },
  { value: "hyna", label: "HyENA" },
] as const;

const AssetsSelectorContent = ({ onSelect }: { onSelect?: () => void }) => {
  const isMobile = useIsMobile();

  const assets = useTickerSelector();
  const { favourites } = useFavoriteStore();

  const instrumentType = useTradeContext((s) => s.instrumentType);
  const { selectTokenFromAssetInfo } = useSelectToken();

  const [state, dispatch] = useReducer(
    (prev: State, next: Partial<State>) => ({ ...prev, ...next }),
    {
      search: "",
      currentTab: instrumentType,
    },
  );

  const isPerps = state.currentTab !== "spot";

  const assetsByTab = useMemo(() => {
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

    return assets;
  }, [state.search, assetsByTab]);

  const onAssetSelected = (asset: Asset) => {
    selectTokenFromAssetInfo(asset);

    onSelect?.();
  };

  return (
    <div className="size-full">
      <div className="w-full mt-2 md:mt-0 px-2 md:px-0">
        <div className="w-full flex items-center h-8 px-2 mb-2 rounded-lg border border-neutral-gray-200 hover:border-primary">
          <Search className="text-gray-600 size-4" />
          <input
            type="search"
            name="search"
            id="search"
            placeholder="Search"
            autoComplete="off"
            autoCorrect="off"
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
          className="w-full mb-4 px-2 md:px-0"
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

        <div className="size-full md:min-h-64 md:max-h-64 overflow-y-auto pb-32 md:pb-2 px-2 md:px-0">
          <DataTable
            columns={ASSETS_SELECTOR_COLUMNS}
            data={data}
            rowCount={20}
            meta={{
              isMobile,
            }}
            state={{
              pagination: {
                pageIndex: 0,
                pageSize: 20,
              },
              columnVisibility: {
                lastPrice: !isMobile,
                priceMobileOnly: isMobile,
                change: !isMobile,
                funding: !isMobile && isPerps,
                volume: !isMobile,
                openInterest: !isMobile && isPerps,
                marketCap: !isMobile && !isPerps,
              },
            }}
            initialState={{
              sorting: [{ id: "volume", desc: true }],
            }}
            tableClassName="w-full text-xs font-medium"
            thClassName="p-0 pb-1 pr-4 h-auto text-neutral-gray-400 text-xs font-medium whitespace-nowrap"
            rowClassName="text-white cursor-pointer"
            rowCellClassName="p-0 py-0.5 md:pr-3"
            onRowClick={onAssetSelected}
            noData="No assets found"
          />
        </div>
      </div>
    </div>
  );
};

export default AssetsSelectorContent;
