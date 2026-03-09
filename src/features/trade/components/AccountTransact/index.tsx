"use client";

import AdaptiveDialog from "@/components/ui/adaptive-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AccountTransactVariant,
  useAccountTransactStore,
} from "@/store/trade/account-transact";

import Deposit from "./Deposit";
import Transfer from "./Transfer";
import Withdraw from "./Withdraw";

const Transact = () => {
  const open = useAccountTransactStore((s) => s.open);
  const variant = useAccountTransactStore((s) => s.variant);

  return (
    <AdaptiveDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) useAccountTransactStore.getState().closeAccountTransact();
      }}
      title="Account"
      className="gap-0 md:gap-2"
    >
      <Tabs
        value={variant}
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
  );
};

export default Transact;
