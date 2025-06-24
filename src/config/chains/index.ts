import { mainnetChains } from "./mainnet";
import { testnetChains } from "./testnet";

const network = process.env.NEXT_PUBLIC_WEB3_NETWORK ?? "testnet";

export const CHAINS_CONFIG =
  network === "mainnet" ? mainnetChains : testnetChains;
