import { wagmiConfig } from "@/config/wagmi";
import {
  ExchangeClient,
  HttpTransport,
  InfoClient,
  InfoConfig,
  SubscriptionClient,
  WebSocketTransport,
} from "@nktkas/hyperliquid";
import { AbstractWallet } from "@nktkas/hyperliquid/signing";
import { toHex } from "viem";
import { getWalletClient } from "wagmi/actions";

export const isTestnet = process.env.NEXT_PUBLIC_WEB3_NETWORK === "testnet";

const transport = new HttpTransport({
  isTestnet,
});

export const infoClient = new InfoClient({ transport });

export const getInfoClient = (
  fetchOptions?: InfoConfig<HttpTransport>["transport"]["fetchOptions"],
) =>
  new InfoClient({
    transport: new HttpTransport({
      isTestnet,
      fetchOptions,
    }),
  });

export const exchangeClient = async (args?: {
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

export const subsClient = new SubscriptionClient({ transport: ws });
