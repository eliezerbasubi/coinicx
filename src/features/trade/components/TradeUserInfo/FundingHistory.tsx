import Link from "next/link";
import { UserFundingsWsEvent } from "@nktkas/hyperliquid";
import { ColumnDef } from "@tanstack/react-table";

import AdaptiveDataTable from "@/components/ui/adaptive-datatable";
import { ROUTES } from "@/constants/routes";
import { parseBuilderDeployedAsset } from "@/features/trade/utils";
import { useShallowUserTradeStore } from "@/store/trade/user-trade";
import { cn } from "@/utils/cn";
import { formatDateTime } from "@/utils/formatting/dates";
import { formatNumber } from "@/utils/formatting/numbers";

import TokenImage from "../TokenImage";

type FundingHistoryEntry = UserFundingsWsEvent["fundings"][number];

const columns: ColumnDef<FundingHistoryEntry>[] = [
  {
    header: "Time",
    accessorFn: (row) => row.time,
    cell({ row: { original } }) {
      return <span>{formatDateTime(original.time)}</span>;
    },
  },
  {
    id: "coin",
    header: "Coin",
    cell({ row: { original } }) {
      const asset = parseBuilderDeployedAsset(original.coin);
      return (
        <Link
          href={`${ROUTES.trade.perps}/${original.coin}`}
          className="font-medium hover:text-primary flex items-center gap-x-1"
        >
          <p>{asset.base}</p>

          {asset.dex && (
            <div className="inline-block p-0.5 px-1 rounded bg-primary/10 text-primary text-[11px] font-medium">
              {asset.dex}
            </div>
          )}
        </Link>
      );
    },
  },
  {
    id: "size",
    header: "Size",
    cell({ row: { original } }) {
      return (
        <span>
          {original.szi} {original.coin}
        </span>
      );
    },
  },
  {
    id: "positionSide",
    header: "Position Side",
    cell({ row: { original } }) {
      return (
        <span
          className={cn("text-buy", {
            "text-sell": Number(original.szi) < 0,
          })}
        >
          {Number(original.szi) > 0 ? "Long" : "Short"}
        </span>
      );
    },
  },
  {
    id: "payment",
    header: "Payment",
    cell({ row: { original } }) {
      return (
        <span
          className={cn("text-buy space-x-1", {
            "text-sell": Number(original.usdc) < 0,
          })}
        >
          <span>
            {formatNumber(Number(original.usdc), {
              minimumFractionDigits: 4,
              maximumFractionDigits: 4,
            })}
          </span>
          <span>USDC</span>
        </span>
      );
    },
  },
  {
    id: "rate",
    header: "Rate",
    cell({ row: { original } }) {
      return (
        <span>
          {formatNumber(Number(original.fundingRate), {
            style: "percent",
            minimumFractionDigits: 4,
            maximumFractionDigits: 4,
          })}
        </span>
      );
    },
  },
];

const FundingHistory = () => {
  const fundings = useShallowUserTradeStore((s) => s.fundings);

  return (
    <AdaptiveDataTable
      columns={columns}
      data={fundings.sort((a, b) => b.time - a.time)}
      loading={false}
      className="space-y-1.5 mb-3"
      thClassName="h-8 py-0 font-medium text-xs"
      rowClassName="text-xs font-medium whitespace-nowrap py-0"
      rowCellClassName="py-1"
      render={(entry: FundingHistoryEntry) => (
        <FundingHistoryCard data={entry} />
      )}
      noData="No funding history yet"
      disablePagination
    />
  );
};

const FundingHistoryCard = ({ data }: { data: FundingHistoryEntry }) => {
  return (
    <div className="flex gap-2 items-center py-1 px-4 last:pb-0">
      <div className="flex-1 flex items-center gap-4">
        <div className="size-9 relative">
          <TokenImage
            key={data.coin}
            name={data.coin}
            instrumentType="perps"
            className="size-9 rounded-full overflow-hidden"
          />
        </div>
        <div className="flex-1 text-sm">
          <p className="text-white font-medium flex items-center">
            {data.coin}
            <span
              className={cn("ml-2 text-xs", {
                "text-buy": Number(data.szi) > 0,
                "text-sell": Number(data.szi) < 0,
              })}
            >
              {Number(data.szi) > 0 ? "Long" : "Short"}
            </span>
          </p>
          <p className="text-xs text-neutral-gray-400 font-medium mt-1">
            Size: {data.szi}
          </p>
        </div>
      </div>
      <div className="flex-1 text-right">
        <p
          className={cn("text-xs font-medium", {
            "text-buy": Number(data.usdc) > 0,
            "text-sell": Number(data.usdc) < 0,
          })}
        >
          {formatNumber(Number(data.usdc), {
            style: "currency",
            minimumFractionDigits: 4,
            maximumFractionDigits: 4,
          })}
        </p>
        <p className="text-xs text-neutral-gray-400 mt-1">
          {formatDateTime(data.time)}
        </p>
      </div>
    </div>
  );
};

export default FundingHistory;
