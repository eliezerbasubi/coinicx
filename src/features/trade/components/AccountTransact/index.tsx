"use client";

import React from "react";

import {
  AccountTransactVariant,
  useAccountTransactStore,
  useShallowAccountTransactStore,
} from "@/lib/store/trade/account-transact";
import AdaptiveDialog from "@/components/ui/adaptive-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import Deposit from "./Deposit";
import SwapStablecoinModal from "./SwapStablecoinModal";
import Transfer from "./Transfer";
import Withdraw from "./Withdraw";

const AccountTransact = () => {
  const { open, variant } = useShallowAccountTransactStore((s) => ({
    open: s.open,
    variant: s.variant,
  }));

  return (
    <React.Fragment>
      <AdaptiveDialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen)
            useAccountTransactStore.getState().closeAccountTransact();
        }}
        title="Account"
        className="gap-0 md:gap-2"
      >
        <Tabs
          value={variant}
          defaultValue="deposit"
          onValueChange={(v) =>
            useAccountTransactStore
              .getState()
              .openAccountTransact(v as AccountTransactVariant)
          }
        >
          <TabsList variant="line" className="w-full justify-start">
            <TabsTrigger value="deposit" className="flex-0">
              Deposit
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="flex-0">
              Withdraw
            </TabsTrigger>
            <TabsTrigger value="transfer" className="flex-0">
              Transfer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deposit">
            <Deposit />
          </TabsContent>

          <TabsContent value="withdraw">
            <Withdraw />
          </TabsContent>

          <TabsContent value="transfer">
            <Transfer />
          </TabsContent>
        </Tabs>
      </AdaptiveDialog>

      <SwapStablecoinModal />
    </React.Fragment>
  );
};

export default AccountTransact;
