import React from "react";

import TooltipTitleTile from "./TooltipTitleTile";
import TooltipTitleWrapper from "./TooltipTitleWrapper";

type Props = {
  ref: React.RefObject<Record<string, HTMLSpanElement | null>>;
  wrapperRef?: React.Ref<HTMLDivElement>;
};

const KlineVolIndicatorTitle = ({ ref, wrapperRef }: Props) => {
  return (
    <div
      ref={wrapperRef}
      className="absolute w-full max-w-xs sm:max-w-sm lg:max-w-md xl:max-w-3xl mt-1"
    >
      <TooltipTitleWrapper>
        <TooltipTitleTile ref={ref} titleKey={"volume"} label={"VOL"} />
      </TooltipTitleWrapper>
    </div>
  );
};

export default KlineVolIndicatorTitle;
