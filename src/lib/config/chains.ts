import { ChainContract } from "viem";
import {
  arbitrum,
  arbitrumSepolia,
  Chain,
  hyperEvm,
  hyperliquidEvmTestnet,
} from "viem/chains";

interface IChain extends Chain {
  contracts: Record<string, ChainContract>;
}

type Network = "testnet" | "mainnet";

export const CHAINS_CONFIG: Record<
  Network,
  Record<"arbitrum" | "hyperEVM", IChain>
> = {
  testnet: {
    arbitrum: {
      ...arbitrumSepolia,
      contracts: {
        token: { address: "0x1baabb04529d43a73232b713c0fe471f7c7334d5" },
        bridge2: { address: "0x08cfc1B6b2dCF36A1480b99353A354AA8AC56f89" },
      },
    },
    hyperEVM: hyperliquidEvmTestnet as IChain,
  },
  mainnet: {
    arbitrum: {
      ...arbitrum,
      contracts: {
        token: { address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" },
        bridge2: { address: "0x2df1c51e09aecf9cacb7bc98cb1742757f163df7" },
      },
    },
    hyperEVM: hyperEvm as IChain,
  },
};

export const CHAINS_CONFIG_ENV =
  process.env.NEXT_PUBLIC_WEB3_NETWORK === "mainnet"
    ? CHAINS_CONFIG.mainnet
    : CHAINS_CONFIG.testnet;
