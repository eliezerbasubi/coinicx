import { Asset } from "@/lib/types/trade";
import { useIsMobile } from "@/hooks/useIsMobile";
import { DataTable } from "@/components/ui/datatable";

import { ASSETS_SELECTOR_COLUMNS } from "./Columns";

type Props = {
  data: Asset[];
  isPerps: boolean;
  pageSize?: number;
  headerClassName?: string;
  onAssetSelected: (asset: Asset) => void;
};

const AssetsSelectorDataTable = ({
  data,
  isPerps,
  headerClassName,
  pageSize = 20,
  onAssetSelected,
}: Props) => {
  const isMobile = useIsMobile();

  return (
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
          pageSize,
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
      headerClassName={headerClassName}
      tableClassName="w-full text-xs font-medium"
      thClassName="p-0 pb-1 pr-4 h-auto text-neutral-gray-400 text-xs font-medium whitespace-nowrap"
      rowClassName="text-white cursor-pointer"
      rowCellClassName="p-0 py-0.5 md:pr-3"
      onRowClick={onAssetSelected}
      noData="No assets found"
    />
  );
};

export default AssetsSelectorDataTable;
