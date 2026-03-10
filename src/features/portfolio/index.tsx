"use client";

import { Button } from "@/components/ui/button";
import AccountTransact from "@/features/trade/components/AccountTransact";
import { useAccountTransactStore } from "@/store/trade/account-transact";

import PortfolioChart from "./components/PortfolioChart";
import PortfolioFees from "./components/PortfolioFees";
import PortfolioOverview from "./components/PortfolioOverview";
import PortfolioUserInfo from "./components/PortfolioUserInfo";

const Portfolio = () => {
  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="w-full flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl font-extrabold text-white">Portfolio</h1>

        <div className="flex items-center gap-1 md:gap-2 py-2">
          <Button
            variant="default"
            size="sm"
            className="flex-1 text-sm font-medium"
            onClick={() =>
              useAccountTransactStore.getState().openAccountTransact("deposit")
            }
          >
            Deposit
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="flex-1 text-white text-sm font-medium"
            onClick={() =>
              useAccountTransactStore.getState().openAccountTransact("withdraw")
            }
          >
            Withdraw
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="flex-1 text-white text-sm font-medium"
            onClick={() =>
              useAccountTransactStore.getState().openAccountTransact("transfer")
            }
          >
            Transfer
          </Button>
        </div>
      </div>

      <div className="w-full flex flex-col md:flex-row items-stretch md:gap-6">
        <PortfolioOverview />
        <PortfolioChart />
      </div>

      <PortfolioFees />

      <PortfolioUserInfo />

      <AccountTransact />
    </div>
  );
};

export default Portfolio;
