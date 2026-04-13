import { cn } from "@/lib/utils/cn";
import TradingButton from "@/components/common/TradingButton";
import TIFSelector from "@/features/trade/components/OrderForm/TIFSelector";

import TradingWidgetHeader from "./TradingWidgetHeader";
import TradingWidgetLimitInput from "./TradingWidgetLimitInput";
import TradingWidgetOrderSize from "./TradingWidgetOrderSize";
import TradingWidgetReview from "./TradingWidgetReview";

type Props = {
  className?: string;
  sideClassName?: string;
  tabsClassName?: string;
  showEventTitle?: boolean;
};

const TradingWidget = ({
  className,
  sideClassName,
  tabsClassName,
  showEventTitle,
}: Props) => {
  return (
    <div className={cn("w-full", className)}>
      <TradingWidgetHeader
        sideClassName={sideClassName}
        tabsClassName={tabsClassName}
        showEventTitle={showEventTitle}
      />

      <div className="w-full px-4">
        <TradingWidgetLimitInput />
        <TradingWidgetOrderSize />

        <div className="w-full border-t border-neutral-gray-200 pt-4 mt-4">
          <TIFSelector className="w-full justify-end mb-3" />
          <TradingWidgetReview />
        </div>
      </div>

      <div className="px-4 mt-4">
        <TradingButton label="Trade" />
      </div>
    </div>
  );
};

export default TradingWidget;
