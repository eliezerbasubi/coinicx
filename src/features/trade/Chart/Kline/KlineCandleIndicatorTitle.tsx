import React from "react";

import { useKlineStore } from "./store/kLineStore";
import TooltipTitleTile from "./TooltipTitleTile";
import TooltipTitleWrapper from "./TooltipTitleWrapper";

type Props = {
  ref: React.RefObject<Record<string, HTMLSpanElement | null>>;
};

const KlineCandleIndicatorTitle = ({ ref }: Props) => {
  const indicatorsLayout = useKlineStore((s) => s.indicatorsLayout);

  const candleLayout = indicatorsLayout.find(
    (layout) => layout.type === "CANDLE",
  );

  if (!candleLayout || !candleLayout.indicators.length) return null;

  return (
    <div className="w-fit max-w-xs sm:max-w-sm lg:max-w-md xl:max-w-3xl">
      <TooltipTitleWrapper>
        {candleLayout.indicators.map((indicator) => (
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
        ))}
      </TooltipTitleWrapper>
    </div>
  );
};

export default KlineCandleIndicatorTitle;
