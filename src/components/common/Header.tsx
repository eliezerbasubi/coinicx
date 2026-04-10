"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartCandlestick,
  Coins,
  RefreshCw,
  TrendingUpDown,
} from "lucide-react";

import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

import AppLogo from "../vectors/app-logo";
import AccountButton from "./AccountButton";

const LINKS = [
  {
    href: `${ROUTES.trade.perps}/BTC`,
    subPaths: [ROUTES.trade.perps, ROUTES.trade.spot],
    label: "Trade",
    id: "trade",
    icon: <Coins />,
  },
  {
    href: ROUTES.swap.index,
    label: "Swap",
    id: "swap",
    icon: <RefreshCw />,
  },
  {
    href: ROUTES.predict.index,
    label: "Predict",
    id: "predict",
    icon: <TrendingUpDown />,
  },
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
    <header className="sticky top-0 z-10 bg-primary-dark standalone:pt-safe-top hidden md:block">
      <div className="w-full h-16 flex justify-between items-center px-4 md:px-6 gap-x-3 md:gap-x-6">
        <AppLogo className="w-15 md:w-20 h-5 md:h-6" />

        <nav
          role="navigation"
          className="hidden md:flex flex-1 gap-x-2 md:gap-x-6"
        >
          {LINKS.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              prefetch
              className={cn(
                "text-white hover:text-primary font-semibold text-xs md:text-base",
                {
                  "text-primary":
                    (link.href === "/" && pathname === "/") ||
                    link.subPaths?.some((path) => pathname.startsWith(path)) ||
                    pathname.startsWith(link.href),
                },
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <AccountButton />
      </div>
    </header>
  );
};

export default Header;
