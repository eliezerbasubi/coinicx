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
              accentColor: "#fcd535",
              accentColorForeground: "#181a20",
              connectButtonBackground: "#181a20",
            },
            shadows: {
              ...rkTheme.shadows,
              walletLogo: "transparent",
            },
            radii: {
              ...rkTheme.radii,
              modal: "0px",
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
