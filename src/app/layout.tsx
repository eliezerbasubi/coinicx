import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans } from "next/font/google";

import "./globals.css";

import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";

import startupImages from "@/lib/utils/appleStartupImages";
import Header from "@/components/common/Header";
import Providers from "@/providers";
import { SerwistProvider } from "@/providers/SerwistProvider";

const APP_NAME = "CoinicX";
const APP_CREATOR = "@coinicx";
const APP_TAGLINE = "Trade beyond the edge";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.APP_BASE_URL ?? "https://coinicx.vercel.app",
  ),
  title: { template: `%s | ${APP_NAME}`, default: "Buy | Sell | Swap" },
  manifest: "/manifest.json",
  description:
    "Buy, Sell, Swap and Trade major assets, stocks, memes, forex and commodities with lower fees. No KYC or sign-ups required. Trade beyond the edge.",
  authors: [{ name: APP_NAME }],
  creator: APP_NAME,
  publisher: APP_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    siteName: APP_NAME,
    images: [
      {
        url: "/app-thumbnail.png",
        width: 1200,
        height: 630,
        alt: `${APP_NAME} - ${APP_TAGLINE}`,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: [
      {
        url: "/app-thumbnail.png",
        width: 1200,
        height: 630,
        alt: `${APP_NAME}-${APP_TAGLINE}`,
      },
    ],
    creator: APP_CREATOR,
    site: APP_CREATOR,
  },
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "32x32",
        type: "image/x-icon",
      },
      {
        url: "/favicon.ico",
        sizes: "16x16",
        type: "image/x-icon",
      },
      {
        url: "/favicon.ico",
        type: "image/x-icon",
      },
      {
        url: "/manifest-icon-512.maskable.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        url: "/manifest-icon-192.maskable.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/manifest-icon-192.maskable.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    shortcut: "/manifest-icon-192.maskable.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_NAME,
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
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#181a20",
  maximumScale: 1,
  initialScale: 1.0,
  userScalable: false,
  width: "device-width",
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
        <Analytics />
      </body>
    </html>
  );
}
