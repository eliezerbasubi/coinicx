import { Chain, ChainContract } from "viem";

type ContractName = "permit2";

export interface IChain extends Chain {
  iconPath: string;
  contracts: Record<ContractName, ChainContract>;
}
