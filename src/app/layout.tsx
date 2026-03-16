import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans } from "next/font/google";

import "./globals.css";

import { Toaster } from "sonner";

import Header from "@/components/common/Header";
import Providers from "@/providers";
import { SerwistProvider } from "@/providers/SerwistProvider";
import startupImages from "@/utils/appleStartupImages";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: { template: "%s | CoinicX", default: "Buy | Sell | Swap" },
  manifest: "/manifest.json",
  description:
    "Buy, Sell, Swap and Trade major assets, stocks, memes, forex and commodities with lower fees. No KYC or sign-ups required. Trade beyond the edge.",
  authors: [{ name: "CoinicX" }],
  creator: "CoinicX",
  publisher: "CoinicX",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CoinicX",
    startupImage: startupImages,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "##181a20",
  maximumScale: 1,
  initialScale: 1.0,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${ibmPlexSans.variable} ${ibmPlexSans.className} font-sans antialiased bg-primary-dark text-white`}
      >
        <SerwistProvider swUrl="/serwist/sw.js">
          <Toaster
            toastOptions={{ className: "min-h-[32px]" }}
            theme="dark"
            position="top-center"
            duration={3000}
            className="font-sans text-sm m-0 items-center rounded-lg px-2 py-0 font-semibold"
          />
          <Providers>
            <Header />
            {children}
          </Providers>
        </SerwistProvider>
      </body>
    </html>
  );
}
