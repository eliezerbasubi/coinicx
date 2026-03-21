"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ROUTES } from "@/lib/constants/routes";
import AccountActions from "@/components/common/AccountActions";

import PortfolioChart from "./components/PortfolioChart";
import PortfolioFees from "./components/PortfolioFees";
import PortfolioOverview from "./components/PortfolioOverview";
import PortfolioUserInfo from "./components/PortfolioUserInfo";

const Portfolio = () => {
  return (
    <div className="w-full max-w-6xl mx-auto py-4 space-y-3 md:space-y-6 standalone:pt-safe-top">
      {/* Header */}
      <div className="w-full flex justify-between items-center flex-wrap gap-4 px-4">
        <Link href={ROUTES.root} className="block md:hidden">
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="text-base md:text-2xl font-semibold md:font-extrabold text-white text-center flex-1 md:flex-0">
          Portfolio
        </h1>

        <AccountActions
          primary="deposit"
          className="w-full md:w-auto flex items-center gap-2 py-0 md:py-2"
          itemClassName="text-xs md:text-sm h-7 md:h-8 font-medium"
        />
      </div>

      <div className="w-full flex flex-col md:flex-row items-stretch gap-3 md:gap-6 px-4">
        <PortfolioOverview />
        <PortfolioChart />
      </div>

      <div className="px-4">
        <PortfolioFees />
      </div>

      <PortfolioUserInfo />
    </div>
  );
};

export default Portfolio;
