import React from "react";

import { cn } from "@/utils/cn";
import { formatNumber } from "@/utils/formatting/numbers";

type Props = {};

const TickerOverview = (props: Props) => {
  return (
    <div className="w-full flex items-center gap-x-6 bg-primary-dark p-4 rounded-md">
      <div className="flex items-center space-x-2">
        <div className="size-8 rounded-full bg-teal-500" />
        <div className="flex-1">
          <p className="text-xl font-bold">BTC/USDT</p>
          <p className="text-xs text-neutral-gray-300">Spot</p>
        </div>
      </div>

      <div>
        <p className="text-xl text-buy font-bold">{formatNumber(110789.85)}</p>
        <p className="text-xs font-semibold">
          {formatNumber(110789.85, { style: "currency" })}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <TickerItem label="24H Change" value={2408.56} percentage={12.5} />
        <TickerItem label="24H High" value={1126854} />
        <TickerItem label="24H Low" value={2408.56} />
        <TickerItem label="24H Volume(BTC)" value={2408.56} />
        <TickerItem label="24H Volume(USDT)" value={2408.56} />
      </div>
    </div>
  );
};

type TickerItemProps = {
  label: string;
  value: number;
  percentage?: number;
};

const TickerItem = ({ label, value, percentage }: TickerItemProps) => {
  return (
    <div className="w-fit text-xs">
      <p className="text-neutral-gray-300 mb-1">{label}</p>

      <div
        className={cn("flex items-center font-medium space-x-1", {
          "text-sell": percentage !== undefined && percentage < 0,
          "text-buy": percentage !== undefined && percentage >= 0,
        })}
      >
        <p>{formatNumber(value)}</p>
        {percentage && <p>+{percentage}</p>}
      </div>
    </div>
  );
};

export default TickerOverview;
