import { useMemo } from "react";
import { formatUnits } from "viem";

import { UNIT_SPOT_ASSETS } from "@/lib/constants/unit";
import { isTestnet } from "@/lib/services/transport";
import { useShallowUserTradeStore } from "@/lib/store/trade/user-trade";
import { AccountActivity } from "@/lib/types/trade";
import { useUnitOperations } from "@/features/trade/hooks/useUnitProtocol";
import {
  buildNonFundingLedgerPayload,
  getNonFundingLedgerAction,
  getOperationStatus,
} from "@/features/trade/utils/accountActivity";

const SPOT_ASSETS = UNIT_SPOT_ASSETS[isTestnet ? "Testnet" : "Mainnet"];

export const useTradingAccountActivity = () => {
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
        type: isDeposit ? "deposit" : "withdrawal",
        isIncoming: isDeposit,
      };
    });

    const fundingLedgerData = nonFundingLedger.map((ledger) => {
      const payload = buildNonFundingLedgerPayload(ledger.delta);

      return {
        timestamp: ledger.time,
        status: "Completed",
        action: getNonFundingLedgerAction(ledger.delta.type),
        ...payload,
      };
    });

    return [...operationData, ...fundingLedgerData];
  }, [operations, nonFundingLedger]);

  return { data, status };
};
