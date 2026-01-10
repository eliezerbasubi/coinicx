import React from "react";

type Props = {
  titleKey: string;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
  ref: React.RefObject<Record<string, HTMLSpanElement | null>>;
};

const TooltipTitleTile = ({
  ref,
  titleKey,
  label,
  className,
  style,
}: Props) => {
  return (
    <>
      {label && (
        <span className="text-neutral-gray-400 font-medium">{label} </span>
      )}
      <span
        className={className}
        style={style}
        ref={(el) => {
          if (ref.current) {
            ref.current[titleKey] = el;
          }
        }}
      />
    </>
  );
};

export default TooltipTitleTile;
