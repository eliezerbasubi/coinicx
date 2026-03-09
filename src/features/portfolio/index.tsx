"use client";

import { Button } from "@/components/ui/button";
import Transact from "@/features/trade/components/AccountTransact";
import { useAccountTransactStore } from "@/store/trade/account-transact";

const Portfolio = () => {
  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      <div className="w-full flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl font-extrabold text-white">Portfolio</h1>

        <div className="flex items-center justify-between gap-1 py-2">
          <Button
            variant="default"
            size="sm"
            className="flex-1 text-xs font-medium h-7"
            onClick={() =>
              useAccountTransactStore.getState().openAccountTransact("deposit")
            }
          >
            Deposit
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="flex-1 text-white text-xs font-medium h-7"
            onClick={() =>
              useAccountTransactStore.getState().openAccountTransact("withdraw")
            }
          >
            Withdraw
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="flex-1 text-white text-xs font-medium h-7"
            onClick={() =>
              useAccountTransactStore.getState().openAccountTransact("transfer")
            }
          >
            Transfer
          </Button>
        </div>
      </div>
      <Transact />
    </div>
  );
};

export default Portfolio;
