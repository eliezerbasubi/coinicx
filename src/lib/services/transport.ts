import {
  ExchangeClient,
  HttpTransport,
  InfoClient,
  SubscriptionClient,
  WebSocketTransport,
} from "@nktkas/hyperliquid";
import { AbstractWallet } from "@nktkas/hyperliquid/signing";
import { toHex } from "viem";
import { getWalletClient } from "wagmi/actions";

import { wagmiConfig } from "@/lib/config/wagmi";

export const isTestnet = process.env.NEXT_PUBLIC_WEB3_NETWORK === "testnet";

const transport = new HttpTransport({
  isTestnet,
});

export const hlInfoClient = new InfoClient({ transport });

export const hlExchangeClient = async (args?: {
  wallet: AbstractWallet;
  signatureChainId?: `0x${string}`;
}) => {
  const client = args?.wallet ?? (await getWalletClient(wagmiConfig));
  return new ExchangeClient({
    wallet: client,
    signatureChainId:
      args?.signatureChainId ?? toHex(wagmiConfig.state.chainId),
    transport,
  });
};

const ws = new WebSocketTransport({ isTestnet });

// TODO: Remove this implementation once the perpAnnotation method is added to the SDK
const TRANSPORT_URLS = {
  testnet: "https://api.hyperliquid-testnet.xyz",
  mainnet: "https://api.hyperliquid.xyz",
};

export const TRANSPORT_URL = TRANSPORT_URLS[isTestnet ? "testnet" : "mainnet"];

export const UNIT_API_BASE_URL = isTestnet
  ? "https://api.hyperunit-testnet.xyz"
  : "https://api.hyperunit.xyz";

export const hlSubClient = new SubscriptionClient({ transport: ws });
