import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useInfoSectionStore, useShallowInfoSectionStore } from "../store";
import ActiveTWAPs from "./ActiveTWAPs";
import FillsTWAPs from "./FillsTWAPs";
import HistoryTWAPs from "./HistoryTWAPs";

const Twaps = () => {
  const twapActiveTab = useShallowInfoSectionStore((s) => s.twapActiveTab);
  return (
    <div className="size-full">
      <Tabs
        defaultValue="active"
        value={twapActiveTab}
        onValueChange={(value) =>
          useInfoSectionStore.setState({ twapActiveTab: value })
        }
        className="h-full gap-0"
      >
        <TabsList
          variant="line"
          className="w-full border-b border-neutral-gray-200 bg-background px-4 inline-block shrink-0 space-x-4 overflow-x-auto [&::-webkit-scrollbar]:hidden sticky top-0 z-1"
        >
          <TabsTrigger value="active" className="w-fit text-xs font-medium">
            Active
          </TabsTrigger>
          <TabsTrigger value="history" className="w-fit text-xs font-medium">
            History
          </TabsTrigger>
          <TabsTrigger value="fills" className="w-fit text-xs font-medium">
            Fill History
          </TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <ActiveTWAPs />
        </TabsContent>
        <TabsContent value="history">
          <HistoryTWAPs />
        </TabsContent>
        <TabsContent value="fills">
          <FillsTWAPs />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Twaps;
