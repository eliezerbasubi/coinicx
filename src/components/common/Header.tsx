"use client";

import React from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import { ROUTES } from "@/constants/routes";

const LINKS = [
  { href: ROUTES.crypto.buy, label: "Buy Crypto", id: "buyCrypto" },
  { href: ROUTES.trade.index, label: "Trade", id: "trade" },
  { href: ROUTES.swap.index, label: "Swap", id: "swap" },
  { href: ROUTES.portfolio.index, label: "Portfolio", id: "portfolio" },
  { href: ROUTES.wallet.index, label: "Wallet", id: "wallet" },
];

const Header = () => {
  return (
    <header className="w-full h-16 flex justify-between items-center px-6">
      <p className="text-xl text-primary font-extrabold">CoinicX</p>

      <div className="flex gap-x-6">
        {LINKS.map((link) => (
          <Link
            key={link.id}
            href={link.href}
            prefetch
            className="text-white hover:text-primary font-semibold"
          >
            {link.label}
          </Link>
        ))}
      </div>

      <ConnectButton />
    </header>
  );
};

export default Header;
