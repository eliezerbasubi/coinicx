import React from "react";
import { Group, Rect, Text } from "react-konva";

import { formatPriceToDecimal } from "@/features/trade/utils";

import { DEPTH_CHART_COLORS, DEPTH_CHART_LAYOUT } from "../constants";
import { DualTooltipState, PlotArea, SideTooltipInfo } from "../types";

type Props = {
  tooltip: DualTooltipState;
  decimals: number | null;
  plotArea: PlotArea;
};

const SingleTooltip = ({
  info,
  side,
  decimals,
  plotArea,
}: {
  info: SideTooltipInfo;
  side: "bid" | "ask";
  decimals: number | null;
  plotArea: PlotArea;
}) => {
  if (!info.visible) return null;

  const {
    tooltipPadding,
    tooltipLineHeight,
    tooltipWidth,
    tooltipFontSize,
    tooltipLabelWidth,
    axisLabelFontFamily,
  } = DEPTH_CHART_LAYOUT;

  const range = ((info.price - info.midPrice) / info.midPrice) * 100;

  const rows = [
    {
      fill:
        side === "bid"
          ? DEPTH_CHART_COLORS.bidStroke
          : DEPTH_CHART_COLORS.askStroke,
      label: "Range",
      value: `${(side === "ask" && "+") || ""}${range.toFixed(2)}%`,
    },
    { label: "Price", value: formatPriceToDecimal(info.price, decimals) },
    {
      label: "Amount",
      value: formatPriceToDecimal(info.cumulative, 2, { notation: "compact" }),
    },
  ];

  const tooltipHeight = tooltipPadding * 2 + rows.length * tooltipLineHeight;
  const offset = 14;

  // Position: bid tooltip to left of crosshair, ask tooltip to right
  let x: number;
  if (side === "bid") {
    x = info.x - tooltipWidth - offset;
    if (x < plotArea.left) x = info.x + offset;
  } else {
    x = info.x + offset;
    if (x + tooltipWidth > plotArea.right + 50) {
      x = info.x - tooltipWidth - offset;
    }
  }

  let y = info.y - tooltipHeight / 2;
  if (y < plotArea.top) y = plotArea.top;
  if (y + tooltipHeight > plotArea.bottom) y = plotArea.bottom - tooltipHeight;

  const valueWidth = tooltipWidth - tooltipPadding * 2 - tooltipLabelWidth;

  return (
    <Group x={x} y={y} listening={false}>
      <Rect
        width={tooltipWidth}
        height={tooltipHeight}
        fill={DEPTH_CHART_COLORS.tooltipBg}
        stroke={DEPTH_CHART_COLORS.tooltipBorder}
        strokeWidth={1}
        cornerRadius={4}
        listening={false}
      />
      {rows.map((row, i) => (
        <React.Fragment key={row.label}>
          <Text
            x={tooltipPadding}
            y={tooltipPadding + i * tooltipLineHeight}
            text={row.label}
            fontSize={tooltipFontSize}
            fontFamily={axisLabelFontFamily}
            fill={DEPTH_CHART_COLORS.tooltipText}
            width={tooltipLabelWidth}
            listening={false}
          />
          <Text
            x={tooltipPadding + tooltipLabelWidth}
            y={tooltipPadding + i * tooltipLineHeight}
            text={row.value}
            fontSize={tooltipFontSize}
            fontFamily={axisLabelFontFamily}
            fill={row.fill ?? DEPTH_CHART_COLORS.tooltipText}
            width={valueWidth}
            align="right"
            wrap="none"
            listening={false}
          />
        </React.Fragment>
      ))}
    </Group>
  );
};

const Tooltip = ({ tooltip, decimals, plotArea }: Props) => {
  if (!tooltip.activeSide) return null;

  return (
    <Group listening={false}>
      <SingleTooltip
        info={tooltip.bid}
        side="bid"
        decimals={decimals}
        plotArea={plotArea}
      />
      <SingleTooltip
        info={tooltip.ask}
        side="ask"
        decimals={decimals}
        plotArea={plotArea}
      />
    </Group>
  );
};

export default React.memo(Tooltip);
