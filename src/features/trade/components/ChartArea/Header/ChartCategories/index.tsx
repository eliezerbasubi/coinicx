import React from "react";
import dynamic from "next/dynamic";
import { useMediaQuery } from "usehooks-ts";

import { ChartType } from "@/types/trade";
import Visibility from "@/components/common/Visibility";

import ChartTimeInterval from "../ChartTimeInterval";
import OrdersSettings from "../OrdersSettings";

const ChartCategoryPopover = dynamic(() => import("./ChartCategoryPopover"), {
  ssr: false,
});
const ChartCategoryInline = dynamic(() => import("./ChartCategoryInline"), {
  ssr: false,
});

type Props = {
  value?: ChartType;
  onValueChange?: (value: ChartType) => void;
};

const ChartCategories = ({ value, onValueChange }: Props) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <div className="w-full border-b border-neutral-gray-200 px-2 md:px-4 h-10 flex items-center">
      <div className="w-full grid grid-cols-[auto_min-content]">
        <div className="w-full flex items-center divide-x divide-neutral-gray-200">
          <Visibility visible={value === "standard"}>
            <ChartTimeInterval />
            <OrdersSettings />
          </Visibility>
        </div>

        {isMobile ? (
          <ChartCategoryPopover value={value} onValueChange={onValueChange} />
        ) : (
          <ChartCategoryInline value={value} onValueChange={onValueChange} />
        )}
      </div>
    </div>
  );
};

export default ChartCategories;
