"use client";

import React from "react";
import { darkTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { Query } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { WagmiProvider } from "wagmi";

import { wagmiConfig } from "@/lib/config/wagmi";

import "@rainbow-me/rainbowkit/styles.css";

import { getQueryClient, isPersistedQuery } from "@/lib/utils/getQueryClient";

type Props = {
  children: React.ReactNode;
};

const queryClient = getQueryClient();

const persister = createAsyncStoragePersister({
  storage: typeof window !== "undefined" ? window.localStorage : undefined,
});

const Web3Provider = ({ children }: Props) => {
  const rkTheme = darkTheme();

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: Infinity,
        buster: "v1.0.0",
        dehydrateOptions: {
          shouldDehydrateQuery: (query) =>
            isPersistedQuery(query as unknown as Query, queryClient),
        },
      }}
    >
      <WagmiProvider config={wagmiConfig}>
        <RainbowKitProvider
          modalSize="compact"
          theme={{
            ...rkTheme,
            fonts: {
              body: "var(--font-ibm-plex-sans)",
            },
            colors: {
              ...rkTheme.colors,
              accentColor: "var(--color-primary)",
              accentColorForeground: "var(--color-background)",
              connectButtonBackground: "var(--color-background)",
            },
            shadows: {
              ...rkTheme.shadows,
              walletLogo: "transparent",
            },
            radii: {
              ...rkTheme.radii,
            },
          }}
        >
          {children}
        </RainbowKitProvider>
      </WagmiProvider>
    </PersistQueryClientProvider>
  );
};

export default Web3Provider;
