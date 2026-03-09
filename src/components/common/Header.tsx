"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit";
import { ChartCandlestick, Coins, Replace } from "lucide-react";
import { useMediaQuery } from "usehooks-ts";
import { useAccount } from "wagmi";

import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

import ConnectButton from "./ConnectButton";
import SideBarMenu from "./Sidebar";

const LINKS = [
  {
    href: `${ROUTES.trade.perps}/BTC`,
    subPaths: [ROUTES.trade.perps, ROUTES.trade.spot],
    label: "Trade",
    id: "trade",
    icon: <Coins />,
  },
  { href: ROUTES.swap.index, label: "Swap", id: "swap", icon: <Replace /> },
  {
    href: ROUTES.portfolio.index,
    label: "Portfolio",
    id: "portfolio",
    icon: <ChartCandlestick />,
  },
];

const Header = () => {
  const pathname = usePathname();
  const { isConnected } = useAccount();
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <header className="w-full h-16 flex justify-between items-center px-4 md:px-6">
      <p className="text-xl text-primary font-extrabold">CoinicX</p>

      <div className="hidden md:flex gap-x-6">
        {LINKS.map((link) => (
          <Link
            key={link.id}
            href={link.href}
            prefetch
            className={cn("text-white hover:text-primary font-semibold", {
              "text-primary":
                (link.href === "/" && pathname === "/") ||
                link.subPaths?.some((path) => pathname.startsWith(path)) ||
                pathname.startsWith(link.href),
            })}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-x-4">
        {(!isConnected && <ConnectButton size="sm" className="w-fit" />) || (
          <RainbowConnectButton
            showBalance={false}
            chainStatus="none"
            accountStatus="avatar"
          />
        )}

        {isMobile && <SideBarMenu links={LINKS} />}
      </div>
    </header>
  );
};

export default Header;
