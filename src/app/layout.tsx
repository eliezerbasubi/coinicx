import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";

import "./globals.css";

import { Toaster } from "sonner";

import Header from "@/components/common/Header";
import Providers from "@/providers";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: { template: "%s | CoinicX", default: "Trade | Swap | Bridge" },
  description: "Trade beyond the edge",
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
      </body>
    </html>
  );
}
