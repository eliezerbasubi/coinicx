import { useMemo, useReducer } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Search } from "lucide-react";

import { ROUTES } from "@/lib/constants/routes";
import { useTradeContext } from "@/lib/store/trade/hooks";
import { useInstrumentStore } from "@/lib/store/trade/instrument";
import { Asset } from "@/lib/types/trade";
import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import { useIsMobile } from "@/hooks/useIsMobile";
import Visibility from "@/components/common/Visibility";
import { DataTable } from "@/components/ui/datatable";
import { DataTableColumnHeader } from "@/components/ui/datatable/ColumnHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPriceToDecimal, getPriceDecimals } from "@/features/trade/utils";

import AssetSymbolTile from "./AssetSymbolTile";
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
  { value: "vntls", label: "Ventuals" },
  { value: "hyna", label: "HyENA" },
];

type TableMeta = {
  isMobile: boolean;
  toggleFavourite: (symbol: string) => void;
};

const columns: ColumnDef<Asset>[] = [
  {
    id: "symbol",
    accessorFn: (row) => row.symbol,
    header: ({ column, table }) => {
      const isMobile = (table.options.meta as TableMeta).isMobile;

      return (
        <div className="flex items-center space-x-1">
          <DataTableColumnHeader
            column={column}
            title="Symbol"
            className="text-xs"
          />
          <Visibility visible={isMobile}>
            <DataTableColumnHeader
              column={table.getColumn("volume")!}
              className="text-xs"
            >
              <span>/</span>
              <p>Vol</p>
            </DataTableColumnHeader>
          </Visibility>
        </div>
      );
    },
    cell({ row: { original } }) {
      return <AssetSymbolTile asset={original} />;
    },
  },
  {
    id: "lastPrice",
    accessorKey: "midPx",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Last Price"
        className="text-xs"
      />
    ),
    cell({ row: { original } }) {
      const pxDecimals = getPriceDecimals(
        original.midPx,
        original.szDecimals,
        original.isSpot,
      );
      return <span>{formatPriceToDecimal(original.midPx, pxDecimals)}</span>;
    },
  },
  {
    id: "change",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="24h Change"
        className="text-xs"
      />
    ),
    accessorFn: (row) => row.markPx - row.prevDayPx,
    cell({ row: { original } }) {
      const hasPricing = original.prevDayPx && original.markPx;
      const change = hasPricing ? original.markPx - original.prevDayPx : 0;
      const changeInPercentage = change
        ? (change / original.prevDayPx) * 100
        : 0;
      const pxDecimals = getPriceDecimals(
        original.midPx,
        original.szDecimals,
        original.isSpot,
      );

      return (
        <p
          className={cn("text-buy space-x-1", {
            "text-sell": change < 0,
            "text-neutral-gray-300": !hasPricing,
          })}
        >
          <span>
            {formatPriceToDecimal(change, pxDecimals, {
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
      );
    },
  },
  {
    id: "funding",
    accessorKey: "funding",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="8h Funding"
        className="text-xs"
      />
    ),
    cell({ row: { original } }) {
      return (
        <span>
          {formatNumber(Number(original.funding ?? 0) / 100, {
            style: "percent",
            useFallback: true,
            minimumFractionDigits: 4,
            maximumFractionDigits: 4,
          })}
        </span>
      );
    },
  },
  {
    id: "volume",
    accessorKey: "dayNtlVlm",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Volume"
        className="text-xs"
      />
    ),
    cell({ row: { original } }) {
      return (
        <span>
          {formatNumber(original.dayNtlVlm, {
            style: "currency",
            useFallback: true,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      );
    },
  },
  {
    id: "openInterest",
    accessorKey: "openInterest",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Open Interest"
        className="text-xs"
      />
    ),
    cell({ row: { original } }) {
      return (
        <span>
          {formatNumber(original.openInterest ?? 0, {
            style: "currency",
            useFallback: true,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      );
    },
  },
  {
    id: "marketCap",
    accessorKey: "marketCap",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Market Cap"
        className="text-xs"
      />
    ),
    cell({ row: { original } }) {
      return (
        <span>
          {formatNumber(original.marketCap ?? 0, {
            style: "currency",
            useFallback: true,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      );
    },
  },
  {
    id: "priceMobileOnly",
    meta: {
      className: "text-right pr-0",
      thClassName: "pr-0",
    },
    header: ({ table }) => (
      <div className="flex items-center justify-end space-x-1">
        <DataTableColumnHeader
          column={table.getColumn("lastPrice")!}
          className="text-xs"
          title="Price"
        />
        <span>/</span>
        <DataTableColumnHeader
          column={table.getColumn("change")!}
          className="text-xs"
          title="24h Change"
        />
      </div>
    ),
    cell({ row: { original } }) {
      const pxDecimals = getPriceDecimals(
        original.midPx,
        original.szDecimals,
        original.isSpot,
      );
      const hasPricing = original.prevDayPx && original.markPx;
      const change = hasPricing ? original.markPx - original.prevDayPx : 0;
      const changeInPercentage = change
        ? (change / original.prevDayPx) * 100
        : 0;

      return (
        <span>
          <p className="text-white font-semibold">
            {formatPriceToDecimal(original.midPx, pxDecimals)}
          </p>
          <p
            className={cn("text-buy space-x-1 text-3xs", {
              "text-sell": changeInPercentage < 0,
              "text-neutral-gray-300": !hasPricing,
            })}
          >
            <span>
              {formatPriceToDecimal(change, pxDecimals, {
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
        </span>
      );
    },
  },
];

const AssetsSelectorContent = ({ onSelect }: { onSelect?: () => void }) => {
  const isMobile = useIsMobile();

  const assets = useTickerSelector();
  const { favourites } = useFavoriteStore();

  const { instrumentType, onAssetChange } = useTradeContext((s) => ({
    instrumentType: s.instrumentType,
    decimals: s.decimals,
    onAssetChange: s.onAssetChange,
  }));

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

        <div className="size-full md:min-h-64 md:max-h-64 overflow-y-auto pb-2">
          <DataTable
            columns={columns}
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
            rowCellClassName="p-0 py-0.5 pr-3"
            onRowClick={onAssetSelected}
            noData="No assets found"
          />
        </div>
      </div>
    </div>
  );
};

export default AssetsSelectorContent;
