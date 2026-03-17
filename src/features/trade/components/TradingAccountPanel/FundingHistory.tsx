import Link from "next/link";
import { UserFundingsWsEvent } from "@nktkas/hyperliquid";
import { ColumnDef } from "@tanstack/react-table";

import AdaptiveDataTable from "@/components/ui/adaptive-datatable";
import Tag from "@/components/ui/tag";
import { ROUTES } from "@/constants/routes";
import { parseBuilderDeployedAsset } from "@/features/trade/utils";
import { useShallowUserTradeStore } from "@/store/trade/user-trade";
import { cn } from "@/utils/cn";
import { formatDateTime } from "@/utils/formatting/dates";
import { formatNumber } from "@/utils/formatting/numbers";

import TokenImage from "../TokenImage";
import CardItem from "./CardItem";
import CoinLink from "./CoinLink";

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
        <CoinLink
          dex={asset.dex}
          href={`${ROUTES.trade.perps}/${original.coin}`}
          symbol={asset.base}
        />
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
      initialState={{
        pagination: {
          pageIndex: 0,
          pageSize: 30,
        },
      }}
      className="space-y-1.5 mb-3"
      wrapperClassName="p-4 md:p-0"
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
  const asset = parseBuilderDeployedAsset(data.coin);
  const isLong = Number(data.szi) > 0;

  return (
    <div className="w-full p-3 bg-neutral-gray-600 rounded-lg">
      <div className="flex items-center justify-between gap-x-4 mb-1">
        <div className="flex items-center gap-x-1">
          <div className="flex items-center gap-x-1 mr-1">
            <TokenImage
              name={asset.base}
              className="size-4"
              instrumentType="perps"
            />
            <Link
              href={`${ROUTES.trade.perps}/${data.coin}`}
              className="text-sm text-neutral-gray-100 font-medium line-clamp-1"
            >
              {asset.base}
            </Link>
          </div>
          {asset.dex && <Tag value={asset.dex} />}
          <Tag
            value={isLong ? "Long" : "Short"}
            className={cn("text-buy bg-buy/10", {
              "text-sell bg-sell/10": !isLong,
            })}
          />
        </div>
        <span className="text-3xs md:text-sm text-neutral-gray-400 font-medium">
          {new Date(data.time).toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      <div className="w-full grid grid-cols-3 gap-2 text-sm">
        <CardItem label="Size" value={`${data.szi} ${data.coin}`} />
        <CardItem
          label="Payment"
          value={formatNumber(Number(data.usdc), {
            minimumFractionDigits: 4,
            maximumFractionDigits: 4,
            symbol: "USDC",
          })}
          className={cn("text-buy", {
            "text-sell": Number(data.usdc) < 0,
          })}
        />
        <CardItem
          label="Rate"
          value={formatNumber(Number(data.fundingRate), {
            style: "percent",
            minimumFractionDigits: 4,
            maximumFractionDigits: 4,
          })}
        />
      </div>
    </div>
  );
};

export default FundingHistory;
