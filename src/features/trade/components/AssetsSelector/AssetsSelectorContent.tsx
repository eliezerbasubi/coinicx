import { useMemo, useReducer } from "react";
import { Search } from "lucide-react";

import { useFavouriteStore } from "@/lib/store/trade/favourites";
import { useTradeContext } from "@/lib/store/trade/hooks";
import { Asset } from "@/lib/types/trade";
import { useAssetsAndContexts } from "@/features/trade/hooks/useAssetAndContexts";
import { useSelectToken } from "@/features/trade/hooks/useSelectToken";

import AssetsSelectorDataTable from "./AssetsSelectorDataTable";
import AssetsSelectorTabs from "./AssetsSelectorTabs";

type State = {
  search: string;
  currentTab: string;
};

const AssetsSelectorContent = ({ onSelect }: { onSelect?: () => void }) => {
  const assets = useAssetsAndContexts();
  const favourites = useFavouriteStore((s) => s.favourites);

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
        <AssetsSelectorTabs
          value={state.currentTab}
          onValueChange={(value) => dispatch({ currentTab: value })}
          className="mb-4 px-2 md:px-0"
        />

        <div className="size-full md:min-h-64 md:max-h-64 overflow-y-auto pb-32 md:pb-2 px-2 md:px-0">
          <AssetsSelectorDataTable
            data={data}
            isPerps={isPerps}
            onAssetSelected={onAssetSelected}
          />
        </div>
      </div>
    </div>
  );
};

export default AssetsSelectorContent;
