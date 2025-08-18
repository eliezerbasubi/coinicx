"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  Bitcoin,
  ChartCandlestick,
  Coins,
  Replace,
  Wallet,
} from "lucide-react";
import { useMediaQuery } from "usehooks-ts";

import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

import SideBarMenu from "./Sidebar";

const LINKS = [
  {
    href: ROUTES.crypto.buy,
    label: "Buy Crypto",
    id: "buyCrypto",
    icon: <Bitcoin />,
    subPaths: [ROUTES.crypto.index, ROUTES.crypto.sell],
  },
  { href: ROUTES.trade.index, label: "Trade", id: "trade", icon: <Coins /> },
  { href: ROUTES.swap.index, label: "Swap", id: "swap", icon: <Replace /> },
  {
    href: ROUTES.portfolio.index,
    label: "Portfolio",
    id: "portfolio",
    icon: <ChartCandlestick />,
  },
  {
    href: ROUTES.wallet.index,
    label: "Wallet",
    id: "wallet",
    icon: <Wallet />,
  },
];

const Header = () => {
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <header className="w-full h-16 flex justify-between items-center px-6">
      <p className="text-xl text-primary font-extrabold">CoinicX</p>

      <div className="hidden md:flex gap-x-6">
        {LINKS.map((link) => (
          <Link
            key={link.id}
            href={link.href}
            prefetch
            className={cn("text-white hover:text-primary font-semibold", {
              "text-primary":
                link.subPaths?.some((path) => pathname.startsWith(path)) ||
                pathname.startsWith(link.href),
            })}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-x-4">
        <div className="min-w-36">
          <ConnectButton />
        </div>

        {isMobile && <SideBarMenu links={LINKS} />}
      </div>
    </header>
  );
};

export default Header;
