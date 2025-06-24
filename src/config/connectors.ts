"use client";

import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  metaMaskWallet,
  trustWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";

const projectId = `${process.env.NEXT_PUBLIC_PROJECT_ID}`;

export const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [
        injectedWallet,

        // We would run into `ReferenceError: indexedDB is not defined` during SSR
        ...(typeof indexedDB !== "undefined"
          ? [trustWallet, metaMaskWallet, walletConnectWallet]
          : []),
      ],
    },
  ],
  {
    appName: "CoinicX",
    projectId,
    appUrl: typeof window !== "undefined" ? window.location.origin : undefined,
  },
);
