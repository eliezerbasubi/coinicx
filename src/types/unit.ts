export type GenerateAddressResponse = {
  address: string;
  signatures: {
    "field-node": string;
    "hl-node": string;
    "node-1": string;
  };
  status: string;
};

export type Operation = {
  opCreatedAt: string;
  operationId: string;
  protocolAddress: string;
  sourceAddress: string;
  destinationAddress: string;
  sourceChain: string;
  destinationChain: string;
  sourceAmount: string;
  destinationFeeAmount: string;
  sweepFeeAmount: string;
  stateStartedAt: string;
  stateUpdatedAt: string;
  stateNextAttemptAt: string;
  sourceTxHash: string;
  sourceTxConfirmations: number;
  destinationTxHash: string;
  asset: string;
  state:
    | "sourceTxDiscovered"
    | "waitForSrcTxFinalization"
    | "buildingDstTx"
    | "signTx"
    | "broadcastTx"
    | "waitForDstTxFinalization"
    | "readyForWithdrawQueue"
    | "queuedForWithdraw"
    | "done"
    | "failure";
};

export type UnitAddress = {
  sourceCoinType: string;
  destinationChain: string;
} & GenerateAddressResponse;
