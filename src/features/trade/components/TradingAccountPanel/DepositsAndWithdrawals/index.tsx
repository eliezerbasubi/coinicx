import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { formatUnits } from "viem";

import { UNIT_SPOT_ASSETS } from "@/lib/constants/unit";
import { isTestnet } from "@/lib/services/transport";
import { useShallowUserTradeStore } from "@/lib/store/trade/user-trade";
import { cn } from "@/lib/utils/cn";
import { formatDateTime } from "@/lib/utils/formatting/dates";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import AdaptiveDataTable from "@/components/ui/adaptive-datatable";
import Tag from "@/components/ui/tag";
import { useUnitOperations } from "@/features/trade/hooks/useUnitProtocol";

import CardItem from "../CardItem";
import {
  buildNonFundingLedgerPayload,
  getNonFundingLedgerAction,
  getOperationStatus,
} from "./utils";

type AccountActivity = {
  timestamp: number;
  status: string;
  action: string;
  source: string;
  destination: string;
  accountChange: number;
  fee: number;
  feeToken: string;
  asset: string;
  type: string;
  isIncoming: boolean;
};

const SPOT_ASSETS = UNIT_SPOT_ASSETS[isTestnet ? "Testnet" : "Mainnet"];

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

const DepositsAndWithdrawals = () => {
  const { operations, status } = useUnitOperations();
  const nonFundingLedger = useShallowUserTradeStore((s) => s.nonFundingLedger);

  const data = useMemo<AccountActivity[]>(() => {
    const operationData = operations.map((operation) => {
      const isDeposit = operation.destinationChain === "hyperliquid";

      // We restrict the chain to non hyperliquid as we don't have it in the list of unit assets
      const chain =
        operation.sourceChain === "hyperliquid"
          ? operation.destinationChain
          : operation.sourceChain;

      const decimals = SPOT_ASSETS[chain].tokens[operation.asset].decimals;

      const sourceAmount = Number(
        formatUnits(BigInt(operation.sourceAmount), decimals),
      );
      const destinationFeeAmount = Number(
        formatUnits(
          BigInt(operation.destinationFeeAmount.split(".")[0]),
          decimals,
        ),
      );

      return {
        timestamp: new Date(operation.stateUpdatedAt).getTime(),
        status: getOperationStatus(operation.state),
        action: isDeposit ? "Deposit" : "Withdrawal",
        source:
          operation.sourceChain === "hyperliquid"
            ? "Spot"
            : operation.sourceChain,
        accountChange: sourceAmount - destinationFeeAmount,
        fee: destinationFeeAmount,
        destination: isDeposit ? "Spot" : operation.destinationChain,
        asset: operation.asset.toLocaleUpperCase(),
        feeToken: operation.asset.toLocaleUpperCase(),
        type: isDeposit ? "unitDeposit" : "unitWithdrawal",
        isIncoming: isDeposit,
      };
    });

    const fundingLedgerData = nonFundingLedger.map((ledger) => {
      const payload = buildNonFundingLedgerPayload(ledger.delta);

      return {
        timestamp: ledger.time,
        status: "Completed",
        type: ledger.delta.type,
        action: getNonFundingLedgerAction(ledger.delta.type),
        ...payload,
      };
    });

    return [...operationData, ...fundingLedgerData];
  }, [operations, nonFundingLedger]);

  return (
    <AdaptiveDataTable
      columns={columns}
      data={data.sort((a, b) => b.timestamp - a.timestamp)}
      loading={status === "pending"}
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
      render={(entry) => <AccountActivityCard data={entry} />}
      noData="No account activity yet"
      disablePagination
    />
  );
};

const AccountActivityCard = ({ data }: { data: AccountActivity }) => {
  const multiplier = data.isIncoming ? 1 : -1;

  return (
    <div className="w-full p-3 bg-neutral-gray-600 rounded-lg">
      <div className="flex items-center justify-between gap-x-4 mb-1">
        <div className="flex items-center gap-x-1">
          <p className="mr-1 line-clamp-1 text-xs font-medium">{data.action}</p>
          <Tag
            value={data.status}
            className="text-neutral-gray-400 bg-neutral-gray-200 capitalize font-medium line-clamp-1"
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

      <div className="w-full grid grid-cols-2 gap-2 text-sm">
        <CardItem
          label="Account Change"
          value={
            <span
              className={cn("text-sell space-x-1", {
                "text-buy": data.isIncoming,
              })}
            >
              <span>
                {formatNumber(data.accountChange * multiplier, {
                  maximumFractionDigits: 6,
                })}
              </span>
              <span>{data.asset}</span>
            </span>
          }
        />
        <CardItem
          label="Fee"
          value={
            <span
              className={cn("text-white space-x-1", {
                "text-sell": !!data.fee,
              })}
            >
              <span>
                {formatNumber(data.fee, {
                  useFallback: true,
                  maximumSignificantDigits: 6,
                })}
              </span>
              <span>{!!data.fee && data.feeToken}</span>
            </span>
          }
        />
        {/* <CardItem label="Source" value={data.source} />
        <CardItem label="Destination" value={data.destination} /> */}
      </div>
    </div>
  );
};

export default DepositsAndWithdrawals;
