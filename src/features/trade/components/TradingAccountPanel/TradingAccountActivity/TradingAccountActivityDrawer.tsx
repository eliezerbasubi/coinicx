import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, History } from "lucide-react";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTradingAccountActivity } from "@/features/trade/hooks/useTradingAccountActivity";

const TradingAccountDataTable = dynamic(
  () => import("./TradingAccountDataTable"),
  { ssr: false },
);

type Props = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const ACCOUNT_ACTIVITY_TABS = [
  { label: "All", value: "all" },
  { label: "Deposits", value: "deposit" },
  { label: "Withdrawals", value: "withdrawal" },
  { label: "Transfers", value: "transfer" },
  { label: "Rewards", value: "rewards" },
  { label: "Vaults", value: "vault" },
] as const;

const TradingAccountActivityDrawer = ({ open, onOpenChange }: Props) => {
  const [filterBy, setFilterBy] = useState("all");

  const { data, status } = useTradingAccountActivity();

  const filteredActivity = useMemo(() => {
    if (filterBy === "all") return data;
    return data.filter((activity) => activity.type === filterBy);
  }, [filterBy, data]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerTitle className="sr-only">Transaction History</DrawerTitle>
      <DrawerTrigger asChild>
        <History className="size-4.5 text-white" />
      </DrawerTrigger>
      <DrawerContent className="w-full! border-l-0! px-0 standalone:pt-safe-top">
        <div className="w-full overflow-y-auto overflow-x-clip">
          <div className="w-full sticky top-0 z-10 bg-primary-dark">
            <div className="flex items-center justify-center gap-2 pt-4 px-4">
              <DrawerClose asChild>
                <ArrowLeft className="size-5" />
              </DrawerClose>
              <h1 className="flex-1 text-center text-base text-white font-semibold">
                Transaction History
              </h1>
            </div>
            <Tabs
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
          <TradingAccountDataTable
            data={filteredActivity}
            loading={status === "pending"}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default TradingAccountActivityDrawer;
