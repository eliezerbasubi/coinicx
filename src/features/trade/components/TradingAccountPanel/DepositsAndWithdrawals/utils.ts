import { UserNonFundingLedgerUpdatesResponse } from "@nktkas/hyperliquid";

import { Operation } from "@/lib/types/unit";
import { getTokenDisplayName } from "@/features/trade/utils/getTokenDisplayName";

type NonFundingLedgerDelta =
  UserNonFundingLedgerUpdatesResponse[number]["delta"];

export const getOperationStatus = (status: Operation["state"]) => {
  switch (status) {
    case "sourceTxDiscovered":
      return "Discovered";
    case "waitForSrcTxFinalization":
      return "Finalizing";
    case "buildingDstTx":
      return "Building Hash";
    case "signTx":
      return "Signing";
    case "broadcastTx":
      return "Broadcasting";
    case "waitForDstTxFinalization":
      return "Waiting for Destination";
    case "readyForWithdrawQueue":
      return "Ready for Withdraw";
    case "queuedForWithdraw":
      return "Queued for Withdraw";
    case "done":
      return "Completed";
    case "failure":
      return "Failed";
    default:
      return status;
  }
};

export const getNonFundingLedgerAction = (
  type: NonFundingLedgerDelta["type"],
) => {
  switch (type) {
    case "send":
      return "Send";
    case "deposit":
      return "Deposit";
    case "vaultDeposit":
      return "Vault Deposit";
    case "vaultCreate":
      return "Vault Create";
    case "vaultWithdraw":
      return "Vault Withdraw";
    case "vaultDistribution":
      return "Vault Distribution";
    case "liquidation":
      return "Liquidation";
    case "rewardsClaim":
      return "Rewards Claim";
    case "deployGasAuction":
      return "Gas Auction";
    case "accountClassTransfer":
    case "internalTransfer":
    case "cStakingTransfer":
    case "spotTransfer":
    case "subAccountTransfer":
      return "Transfer";
    case "withdraw":
      return "Withdrawal";
    default:
      return type;
  }
};

type NonFundingLedgerDeltaPayload = {
  source: string;
  destination: string;
  accountChange: number;
  fee: number;
  feeToken: string;
  asset: string;
  isIncoming: boolean;
};

export const buildNonFundingLedgerPayload = (
  delta: NonFundingLedgerDelta,
): NonFundingLedgerDeltaPayload => {
  switch (delta.type) {
    case "send":
      return {
        source: delta.sourceDex || "Perps", // Empty string is referred to perps dex
        destination: delta.destinationDex || "Perps",
        accountChange: Number(delta.amount) + Number(delta.nativeTokenFee),
        fee: Number(delta.fee),
        feeToken: delta.feeToken,
        asset: delta.token,
        isIncoming: false,
      };
    case "deposit":
      return {
        source: "Arbitrum",
        destination: "Perps",
        accountChange: Number(delta.usdc),
        fee: 0,
        feeToken: "",
        asset: "USDC",
        isIncoming: true,
      };
    case "accountClassTransfer":
      return {
        source: delta.toPerp ? "Spot" : "Perps",
        destination: delta.toPerp ? "Perps" : "Spot",
        accountChange: Number(delta.usdc),
        fee: 0,
        feeToken: "",
        asset: "USDC",
        isIncoming: false,
      };
    case "internalTransfer":
      return {
        source: "Perps",
        destination: "Perps",
        accountChange: Number(delta.usdc) - Number(delta.fee),
        fee: Number(delta.fee),
        feeToken: "USDC",
        asset: "USDC",
        isIncoming: true,
      };
    case "cStakingTransfer":
      return {
        source: delta.isDeposit ? "Spot" : "Staking",
        destination: delta.isDeposit ? "Staking" : "Spot",
        accountChange: Number(delta.amount),
        fee: 0,
        feeToken: "",
        asset: delta.token,
        isIncoming: !delta.isDeposit, // True if user is withdrawing from staking balance to spot balance
      };
    case "spotTransfer":
      return {
        source: "Spot",
        destination: "Spot",
        accountChange: Number(delta.amount) + Number(delta.nativeTokenFee),
        fee: Number(delta.fee),
        feeToken: delta.feeToken,
        asset: getTokenDisplayName(delta.token),
        isIncoming: false,
      };
    case "subAccountTransfer":
      return {
        source: "Perps",
        destination: "Perps",
        accountChange: Number(delta.usdc),
        fee: 0,
        feeToken: "",
        asset: "USDC",
        isIncoming: true,
      };
    case "withdraw":
      return {
        source: "Perps",
        destination: "Arbitrum",
        accountChange: Number(delta.usdc) + Number(delta.fee),
        fee: Number(delta.fee),
        feeToken: "USDC",
        asset: "USDC",
        isIncoming: false,
      };
    case "vaultDeposit":
      return {
        source: "Perps",
        destination: "Perps",
        accountChange: Number(delta.usdc),
        fee: 0,
        feeToken: "",
        asset: "USDC",
        isIncoming: true,
      };
    case "vaultCreate":
      return {
        source: "Perps",
        destination: "Perps",
        accountChange: Number(delta.usdc) + Number(delta.fee),
        fee: Number(delta.fee),
        feeToken: "USDC",
        asset: "USDC",
        isIncoming: false,
      };
    case "vaultWithdraw":
      return {
        source: "Perps",
        destination: "Perps",
        accountChange:
          Number(delta.netWithdrawnUsd) + Number(delta.closingCost),
        fee: Number(delta.closingCost),
        feeToken: "USDC",
        asset: "USDC",
        isIncoming: false,
      };
    case "vaultDistribution":
      return {
        source: "Perps",
        destination: "Perps",
        accountChange: Number(delta.usdc),
        fee: 0,
        feeToken: "",
        asset: "USDC",
        isIncoming: true,
      };
    case "rewardsClaim":
      return {
        source: "Rewards",
        destination: "Wallet",
        accountChange: Number(delta.amount),
        fee: 0,
        feeToken: "",
        asset: delta.token,
        isIncoming: true,
      };
    case "deployGasAuction":
      return {
        source: "Vault",
        destination: "Spot",
        accountChange: Number(delta.amount),
        fee: 0,
        feeToken: "",
        asset: delta.token,
        isIncoming: false,
      };
    default:
      return {
        source: "Spot",
        destination: "Spot",
        accountChange: 0,
        fee: 0,
        feeToken: "",
        asset: "USDC",
        isIncoming: true,
      };
  }
};
