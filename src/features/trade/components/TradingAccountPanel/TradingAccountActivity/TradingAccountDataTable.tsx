import { ColumnDef } from "@tanstack/react-table";

import { AccountActivity } from "@/lib/types/trade";
import { cn } from "@/lib/utils/cn";
import { formatDateTime } from "@/lib/utils/formatting/dates";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import AdaptiveDataTable from "@/components/ui/adaptive-datatable";

import TradingAccountActivityCard from "./TradingAccountActivityCard";

const columns: ColumnDef<AccountActivity>[] = [
  {
    header: "Time",
    id: "timestamp",
    cell({ row: { original } }) {
      return <span>{formatDateTime(original.timestamp)}</span>;
    },
  },
  {
    id: "status",
    header: "Status",
    cell({ row: { original } }) {
      return <span>{original.status}</span>;
    },
  },
  {
    id: "action",
    header: "Action",
    cell({ row: { original } }) {
      return <span>{original.action}</span>;
    },
  },
  {
    id: "source",
    header: "Source",
    cell({ row: { original } }) {
      return <span className="capitalize">{original.source}</span>;
    },
  },
  {
    id: "destination",
    header: "Destination",
    cell({ row: { original } }) {
      return <span className="capitalize">{original.destination}</span>;
    },
  },
  {
    id: "accountChange",
    header: "Account Change",
    cell({ row: { original } }) {
      const multiplier = original.isIncoming ? 1 : -1;
      return (
        <span
          className={cn("text-sell space-x-1", {
            "text-buy": original.isIncoming,
          })}
        >
          <span>
            {formatNumber(original.accountChange * multiplier, {
              maximumFractionDigits: 6,
            })}
          </span>
          <span>{original.asset}</span>
        </span>
      );
    },
  },
  {
    id: "fee",
    header: "Fee",
    cell({ row: { original } }) {
      return (
        <span
          className={cn("text-white space-x-1", {
            "text-sell": !!original.fee,
          })}
        >
          <span>
            {formatNumber(original.fee, {
              useFallback: true,
              maximumSignificantDigits: 6,
            })}
          </span>
          <span>{!!original.fee && original.feeToken}</span>
        </span>
      );
    },
  },
];

type Props = {
  data: AccountActivity[];
  loading?: boolean;
  showCardsOnly?: boolean;
};

const TradingAccountDataTable = ({ data, loading, showCardsOnly }: Props) => {
  return (
    <AdaptiveDataTable
      columns={columns}
      data={data.sort((a, b) => b.timestamp - a.timestamp)}
      loading={loading}
      initialState={{
        pagination: {
          pageIndex: 0,
          pageSize: 30,
        },
      }}
      className="space-y-1.5 mb-3"
      wrapperClassName="p-2 md:p-0"
      thClassName="h-8 py-0 font-medium text-xs"
      rowClassName="text-xs font-medium whitespace-nowrap py-0"
      rowCellClassName="py-1"
      render={(entry) => <TradingAccountActivityCard data={entry} />}
      noData="No account activity yet"
      disablePagination
      variant={showCardsOnly ? "card" : undefined}
    />
  );
};

export default TradingAccountDataTable;
