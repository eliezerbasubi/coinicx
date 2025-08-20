"use client";

import React from "react";
import { darkTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

import { wagmiConfig } from "@/config/wagmi";

import "@rainbow-me/rainbowkit/styles.css";

type Props = {
  children: React.ReactNode;
};

const queryClient = new QueryClient();

const Web3Provider = ({ children }: Props) => {
  const rkTheme = darkTheme();
  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
};

export default Web3Provider;
