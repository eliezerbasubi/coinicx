import { useMemo } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";

import AdaptiveDataTable from "@/components/ui/adaptive-datatable";
import Tag from "@/components/ui/tag";
import TokenImage from "@/features/trade/components/TokenImage";
import { useShallowUserTradeStore } from "@/store/trade/user-trade";
import { cn } from "@/utils/cn";
import { formatDateTime } from "@/utils/formatting/dates";
import { formatNumber } from "@/utils/formatting/numbers";

import CardItem from "../CardItem";
import CoinLink from "../CoinLink";
import { useSpotToTokenDetails } from "../hooks/useSpotToTokenDetails";

type TwapHistoryFills = {
  timestamp: number;
  coin: string;
  dex: string | null;
  base: string;
  symbol: string;
  href: string;
  side: string;
  direction: string;
  price: number;
  sz: number;
  tradeValue: number;
  fee: number;
  closedPnl: number;
  feeToken: string;
};

const columns: ColumnDef<TwapHistoryFills>[] = [
  {
    header: "Time",
    accessorFn: (row) => row.timestamp,
    cell({ row: { original } }) {
      return <span>{formatDateTime(original.timestamp)}</span>;
    },
  },
  {
    id: "coin",
    header: "Coin",
    cell({ row: { original } }) {
      return (
        <CoinLink
          symbol={original.symbol}
          dex={original.dex}
          href={original.href}
        />
      );
    },
  },
  {
    id: "direction",
    header: "Direction",
    cell({ row: { original } }) {
      return (
        <span
          className={cn("text-buy", {
            "text-sell": original.side === "A",
          })}
        >
          {original.direction}
        </span>
      );
    },
  },
  {
    id: "price",
    header: "Price",
    cell({ row: { original } }) {
      return (
        <span>
          {formatNumber(original.price, {
            maximumSignificantDigits: 8,
            minimumSignificantDigits: 5,
            maximumFractionDigits: 8,
          })}
        </span>
      );
    },
  },
  {
    id: "size",
    header: "Size",
    cell({ row: { original } }) {
      return (
        <span className="space-x-1">
          <span>
            {formatNumber(original.sz, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 5,
            })}
          </span>
          <span>{original.base}</span>
        </span>
      );
    },
  },
  {
    id: "tradeValue",
    header: "Trade Value",
    cell({ row: { original } }) {
      return (
        <span className="space-x-1">
          <span>
            {formatNumber(original.tradeValue, {
              minimumFractionDigits: 2,
            })}
          </span>
          <span>{original.feeToken}</span>
        </span>
      );
    },
  },
  {
    id: "fee",
    header: "Fee",
    cell({ row: { original } }) {
      return (
        <span className="space-x-1">
          <span>
            {formatNumber(Number(original.fee), {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          <span>{original.feeToken}</span>
        </span>
      );
    },
  },
  {
    id: "closedPnl",
    header: "Closed PNL",
    cell({ row: { original } }) {
      return (
        <span className="space-x-1">
          <span>
            {formatNumber(original.closedPnl, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          <span>{original.feeToken}</span>
        </span>
      );
    },
  },
];

const FillsTWAPs = () => {
  const { mapSpotNameToTokenDetails } = useSpotToTokenDetails();

  const twapSliceFills = useShallowUserTradeStore(
    (s) => s.twapStates.sliceFills,
  );

  const data = useMemo(() => {
    return twapSliceFills.map((sliceFill) => {
      const fill = sliceFill.fill;

      const tokenDetails = mapSpotNameToTokenDetails(fill.coin);

      // Closed Pnl includes fees and rebates, so we subtract the fee to get the actual PnL
      const closedPnl = Number(fill.closedPnl) - Number(fill.fee);

      return {
        timestamp: fill.time,
        dex: tokenDetails.dex,
        href: tokenDetails.href,
        base: tokenDetails.base,
        coin: tokenDetails.coin,
        symbol: tokenDetails.symbol,
        feeToken: fill.feeToken,
        direction: fill.dir,
        fee: Number(fill.fee),
        sz: Number(fill.sz),
        side: fill.side,
        price: Number(fill.px),
        tradeValue: Number(fill.px) * Number(fill.sz),
        closedPnl,
      };
    });
  }, [mapSpotNameToTokenDetails, twapSliceFills]);

  return (
    <AdaptiveDataTable
      columns={columns}
      data={data.sort((a, b) => b.timestamp - a.timestamp)}
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
      render={(entry: TwapHistoryFills) => <FillTWAPHistoryCard data={entry} />}
      noData="No TWAP history yet"
      disablePagination
    />
  );
};

const FillTWAPHistoryCard = ({ data }: { data: TwapHistoryFills }) => {
  const closedPnl = data.closedPnl;

  return (
    <div className="w-full p-3 bg-neutral-gray-600 rounded-lg">
      <div className="flex items-center justify-between gap-x-4 mb-1">
        <div className="flex items-center gap-x-1">
          <div className="flex items-center gap-x-1 mr-1">
            <TokenImage
              name={data.coin}
              className="size-4"
              instrumentType="perps"
            />
            <Link
              href={data.href}
              className="text-sm text-neutral-gray-100 font-medium line-clamp-1"
            >
              {data.symbol}
            </Link>
          </div>
          {data.dex && <Tag value={data.dex} />}
          <Tag
            value={data.direction}
            className={cn("text-buy bg-buy/10", {
              "text-sell bg-sell/10": data.side === "A",
            })}
          />
          <Tag
            value={`${formatNumber(closedPnl, {
              useSign: true,
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} ${data.feeToken}`}
            className={cn("text-buy bg-buy/10", {
              "text-sell bg-sell/10": closedPnl < 0,
            })}
          />
        </div>
        <span className="text-[11px] md:text-sm text-neutral-gray-400 font-medium">
          {new Date(data.timestamp).toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      <div className="w-full grid grid-cols-4 gap-2 text-sm">
        <CardItem
          label="Price"
          value={formatNumber(data.price, {
            maximumFractionDigits: 5,
          })}
        />
        <CardItem
          label="Size"
          value={`${formatNumber(data.sz, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 5,
          })} ${data.base}`}
        />
        <CardItem
          label={`Value (${data.feeToken})`}
          value={formatNumber(data.tradeValue, {
            minimumFractionDigits: 2,
          })}
        />
        <CardItem
          label="Fee"
          value={`${formatNumber(data.fee, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })} ${data.feeToken}`}
        />
      </div>
    </div>
  );
};

export default FillsTWAPs;
