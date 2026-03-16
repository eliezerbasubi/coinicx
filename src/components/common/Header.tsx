"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartCandlestick, Coins, Replace } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

import AppLogo from "../vectors/app-logo";
import AccountButton from "./AccountButton";
import SideBar from "./Sidebar";

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

  return (
    <header className="w-full h-16 flex justify-between items-center px-4 md:px-6 md:gap-x-6">
      <AppLogo className="w-20 md:w-fit h-6" textClassName="hidden md:block" />

      <div className="hidden md:flex flex-1 gap-x-6">
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

      <div className="flex items-center gap-x-2">
        <AccountButton />

        <SideBar links={LINKS} />
      </div>
    </header>
  );
};

export default Header;
