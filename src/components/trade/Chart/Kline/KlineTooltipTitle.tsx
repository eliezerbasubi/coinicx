import React from "react";

import TooltipTitleTile from "./TooltipTitleTile";
import TooltipTitleWrapper from "./TooltipTitleWrapper";

type Props = {
  ref: React.RefObject<Record<string, HTMLSpanElement | null>>;
};

const TITLES = [
  { key: "open", label: "Open:" },
  { key: "high", label: "High:" },
  { key: "low", label: "Low:" },
  { key: "close", label: "Close:" },
  { key: "change", label: "Change:" },
];

const KlineTooltipTitle = (props: Props) => {
  return (
    <div className="w-full max-w-sm md:max-w-2xl xl:max-w-3xl">
      <TooltipTitleWrapper>
        <TooltipTitleTile
          titleKey="timestamp"
          ref={props.ref}
          className="text-neutral-gray-400 font-medium"
        />
        {TITLES.map((title) => (
          <TooltipTitleTile
            key={title.key}
            titleKey={title.key}
            label={title.label}
            ref={props.ref}
          />
        ))}
      </TooltipTitleWrapper>
    </div>
  );
};

export default KlineTooltipTitle;
