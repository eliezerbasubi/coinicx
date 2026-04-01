import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, History } from "lucide-react";
import { useWebHaptics } from "web-haptics/react";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AuthenticatedContent from "@/features/trade/components/AuthenticatedContent";
import { useTradingAccountActivity } from "@/features/trade/hooks/useTradingAccountActivity";

const TradingAccountDataTable = dynamic(
  () => import("./TradingAccountDataTable"),
  { ssr: false },
);

const ACCOUNT_ACTIVITY_TABS = [
  { label: "All", value: "all" },
  { label: "Deposits", value: "deposit" },
  { label: "Withdrawals", value: "withdrawal" },
  { label: "Transfers", value: "transfer" },
  { label: "Rewards", value: "rewards" },
  { label: "Vaults", value: "vault" },
] as const;

const TradingAccountActivityDrawer = () => {
  const haptic = useWebHaptics();

  const [open, setOpen] = useState(false);

  return (
    <>
      <History
        type="button"
        data-slot="drawer-trigger"
        onClick={() => {
          setOpen(true);
          haptic.trigger("selection");
        }}
        className="size-4.5 text-white"
      />
      <Drawer open={open} onOpenChange={setOpen} direction="right">
        <DrawerContent className="w-full! border-l-0! px-0 standalone:pt-safe-top pb-0">
          <TradingAccountActivityContent />
        </DrawerContent>
      </Drawer>
    </>
  );
};

const TradingAccountActivityContent = () => {
  const [filterBy, setFilterBy] = useState("all");

  const { data, status } = useTradingAccountActivity();

  const filteredActivity = useMemo(() => {
    if (filterBy === "all") return data;
    return data.filter((activity) => activity.type === filterBy);
  }, [filterBy, data]);

  return (
    <div className="w-full overflow-y-auto pb-safe-bottom">
      <div className="w-full sticky top-0 z-10 bg-primary-dark">
        <DrawerHeader className="p-0">
          <DrawerTitle className="flex items-center justify-center gap-2 pt-4 px-4">
            <DrawerClose asChild>
              <ArrowLeft className="size-5" />
            </DrawerClose>
            <p className="flex-1 text-center text-base text-white font-semibold">
              Transaction History
            </p>
          </DrawerTitle>
          <DrawerDescription className="sr-only">
            Showing user's transactions history
          </DrawerDescription>
        </DrawerHeader>
        <Tabs
          data-vaul-no-drag
          defaultValue={filterBy}
          onValueChange={setFilterBy}
          className="overflow-x-auto no-scrollbars"
        >
          <TabsList variant="line" className="justify-start px-4">
            {ACCOUNT_ACTIVITY_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex-0 text-xs"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <AuthenticatedContent className="h-20">
        <TradingAccountDataTable
          data={filteredActivity}
          loading={status === "pending"}
        />
      </AuthenticatedContent>
    </div>
  );
};

export default TradingAccountActivityDrawer;
