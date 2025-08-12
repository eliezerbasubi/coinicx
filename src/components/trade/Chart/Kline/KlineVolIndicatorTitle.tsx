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
      className="absolute w-full max-w-2xl xl:max-w-3xl mt-1"
    >
      <TooltipTitleWrapper>
        <TooltipTitleTile ref={ref} titleKey={"volume"} label={"VOL"} />
        {/* {indicators.map((indicator) => (
              <div key={indicator.name} className="inline-flex gap-2">
                {indicator.params.map((param, index) => {
                  if (!param.period) return null;
    
                  return (
                    <TooltipTitleTile
                      key={`${indicator.name}[${index}]`}
                      ref={ref}
                      titleKey={`${indicator.name}[${index}]`}
                      label={`${indicator.name}(${param.period})`}
                      style={{ color: param.color }}
                    />
                  );
                })}
              </div>
            ))} */}
      </TooltipTitleWrapper>
    </div>
  );
};

export default KlineVolIndicatorTitle;
