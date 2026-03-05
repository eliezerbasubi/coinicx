import React, { useMemo, useReducer, useState } from "react";

import { Position } from "@/types/trade";
import TradingButton from "@/components/common/TradingButton";
import Visibility from "@/components/common/Visibility";
import AdaptiveDialog from "@/components/ui/adaptive-dialog";
import { InputNumberControl } from "@/components/ui/input-number";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Tag from "@/components/ui/tag";
import OrderFormSlider from "@/features/trade/components/OrderForm/OrderFormSlider";
import { useTriggerPrice } from "@/features/trade/hooks/useTriggerPrice";
import { formatPriceToDecimal, roundToDecimals } from "@/features/trade/utils";
import { cn } from "@/utils/cn";
import { formatNumber } from "@/utils/formatting/numbers";

type Props = {
  position: Position;
  trigger: React.ReactNode;
};

type GainMode = "roi" | "pnl";

type State = {
  tpPrice: string;
  slPrice: string;
  tpGain: string;
  slGain: string;
  tpGainMode: GainMode;
  slGainMode: GainMode;
  size: string;
  sizePercentage: number;
  currentTab: "full" | "partial";
};

const TriggerPrice = ({ position, trigger }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <AdaptiveDialog
      open={open}
      onOpenChange={setOpen}
      title={
        <div className="flex items-center gap-x-2">
          <span>Set Trigger Price ({position.base})</span>
          <Tag
            value={position.isLong ? "Long" : "Short"}
            className={cn("text-buy bg-buy/10", {
              "text-sell bg-sell/10": !position.isLong,
            })}
          />
          <Tag
            value={`${position.leverage.value}x ${position.leverage.type}`}
            className={cn("text-buy bg-buy/10 capitalize", {
              "text-sell bg-sell/10": !position.isLong,
            })}
          />
        </div>
      }
      trigger={trigger}
      className="gap-1"
    >
      <TriggerPriceContent
        position={position}
        onSuccess={() => setOpen(false)}
      />
    </AdaptiveDialog>
  );
};

type TriggerPriceContentProps = {
  position: Position;
  onSuccess?: () => void;
};

const TABS = [
  { label: "Full Position", value: "full" },
  { label: "Partial Position", value: "partial" },
] as const;

const TriggerPriceContent = ({
  position,
  onSuccess,
}: TriggerPriceContentProps) => {
  const positionSize = Math.abs(Number(position.szi));

  const [state, dispatch] = useReducer(
    (prev: State, next: Partial<State>) => ({ ...prev, ...next }),
    {
      tpPrice: "",
      slPrice: "",
      tpGain: "",
      slGain: "",
      tpGainMode: "roi" as GainMode,
      slGainMode: "roi" as GainMode,
      size: position.szi,
      sizePercentage: 100,
      currentTab: "full" as const,
    },
  );

  const { processing, setTriggerPrice } = useTriggerPrice({ onSuccess });

  const entryPrice = Number(position.entryPx);
  const effectiveSize =
    state.currentTab === "full" ? positionSize : Math.abs(Number(state.size));

  // Compute TP gain/loss
  const tpEstimates = useMemo(() => {
    const tp = parseFloat(state.tpPrice);
    if (!tp || !effectiveSize) return { pnl: 0, roi: 0 };

    const pnl = position.isLong
      ? (tp - entryPrice) * effectiveSize
      : (entryPrice - tp) * effectiveSize;

    const marginUsed = (effectiveSize * entryPrice) / position.leverage.value;
    const roi = marginUsed > 0 ? (pnl / marginUsed) * 100 : 0;

    return { pnl, roi };
  }, [
    state.tpPrice,
    effectiveSize,
    position.isLong,
    entryPrice,
    position.leverage.value,
  ]);

  // Compute SL gain/loss
  const slEstimates = useMemo(() => {
    const sl = parseFloat(state.slPrice);
    if (!sl || !effectiveSize) return { pnl: 0, roi: 0 };

    const pnl = position.isLong
      ? (sl - entryPrice) * effectiveSize
      : (entryPrice - sl) * effectiveSize;

    const marginUsed = (effectiveSize * entryPrice) / position.leverage.value;
    const roi = marginUsed > 0 ? (pnl / marginUsed) * 100 : 0;

    return { pnl, roi };
  }, [
    state.slPrice,
    effectiveSize,
    position.isLong,
    entryPrice,
    position.leverage.value,
  ]);

  const computeGainFromPrice = (price: number, gainMode: GainMode) => {
    if (!price || !effectiveSize) return "";

    const pnl = position.isLong
      ? (price - entryPrice) * effectiveSize
      : (entryPrice - price) * effectiveSize;

    if (gainMode === "pnl") {
      return roundToDecimals(pnl, 2).toString();
    }

    const marginUsed = (effectiveSize * entryPrice) / position.leverage.value;
    const roi = marginUsed > 0 ? (pnl / marginUsed) * 100 : 0;
    return roundToDecimals(roi, 2).toString();
  };

  const formatPrice = (price: number) => {
    if (price <= 0) return "";
    return roundToDecimals(price, position.pxDecimals).toString();
  };

  // Sync gain → price
  const onTpGainChange = (value: string) => {
    dispatch({ tpGain: value });
    const gain = parseFloat(value);
    if (!gain) return;

    const marginUsed = (positionSize * entryPrice) / position.leverage.value;

    if (state.tpGainMode === "pnl") {
      const price = position.isLong
        ? entryPrice + gain / effectiveSize
        : entryPrice - gain / effectiveSize;
      dispatch({ tpPrice: formatPrice(price) });
    } else {
      const pnl = (gain / 100) * marginUsed;
      const price = position.isLong
        ? entryPrice + pnl / effectiveSize
        : entryPrice - pnl / effectiveSize;
      dispatch({ tpPrice: formatPrice(price) });
    }
  };

  const onSlGainChange = (value: string) => {
    dispatch({ slGain: value });
    const gain = parseFloat(value);
    if (!gain) return;

    const marginUsed = (positionSize * entryPrice) / position.leverage.value;

    if (state.slGainMode === "pnl") {
      const price = position.isLong
        ? entryPrice - gain / effectiveSize
        : entryPrice + gain / effectiveSize;
      dispatch({ slPrice: formatPrice(price) });
    } else {
      const pnl = (gain / 100) * marginUsed;
      const price = position.isLong
        ? entryPrice - pnl / effectiveSize
        : entryPrice + pnl / effectiveSize;
      dispatch({ slPrice: formatPrice(price) });
    }
  };

  // Sync price → gain
  const onTpPriceChange = (value: string) => {
    const tpGain = computeGainFromPrice(parseFloat(value), state.tpGainMode);
    dispatch({ tpPrice: value, tpGain });
  };

  const onSlPriceChange = (value: string) => {
    const slGain = computeGainFromPrice(parseFloat(value), state.slGainMode);
    dispatch({ slPrice: value, slGain });
  };

  const onSizePercentageChange = (value: number) => {
    const newSize = positionSize * (value / 100);
    dispatch({
      sizePercentage: value,
      size: newSize.toString(),
    });
  };

  const onSizeChange = (value: string) => {
    const parsed = Math.abs(Number(value));
    const percentage = positionSize > 0 ? (parsed / positionSize) * 100 : 0;
    dispatch({
      size: value,
      sizePercentage: Math.min(Math.round(percentage), 100),
    });
  };

  const disabled =
    (!state.tpPrice && !state.slPrice) ||
    (state.currentTab === "partial" && !parseFloat(state.size)) ||
    processing;

  return (
    <Tabs
      value={state.currentTab}
      className="h-full gap-0"
      onValueChange={(value) =>
        dispatch({ currentTab: value as State["currentTab"] })
      }
    >
      <TabsList
        variant="line"
        className="w-full shrink-0 space-x-0 md:space-x-2 justify-start"
      >
        {TABS.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="w-fit flex-0 text-xs font-medium"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="w-full mt-2 space-y-3">
        <PositionDetails position={position} />

        {/* Partial Position: Size Input + Slider */}
        <Visibility visible={state.currentTab === "partial"}>
          <div className="space-y-2">
            <InputNumberControl
              label="Size"
              value={state.size}
              trailing={<p className="text-sm font-medium">{position.coin}</p>}
              onValueChange={onSizeChange}
            />
            <OrderFormSlider
              value={state.sizePercentage}
              onValueChange={onSizePercentageChange}
            />
          </div>
        </Visibility>

        {/* Take Profit Section */}
        <div className="space-y-1.5">
          <p className="text-xs text-neutral-gray-400 font-medium">
            Take Profit ({state.tpGainMode === "roi" ? "ROI%" : "PNL"})
          </p>
          <div className="grid grid-cols-2 gap-2">
            <InputNumberControl
              label="TP Price"
              value={state.tpPrice}
              onValueChange={onTpPriceChange}
            />
            <InputNumberControl
              label="Gain"
              value={state.tpGain}
              onValueChange={onTpGainChange}
              trailing={
                <GainModeSelect
                  value={state.tpGainMode}
                  onChange={(mode) =>
                    dispatch({ tpGainMode: mode, tpGain: "" })
                  }
                />
              }
            />
          </div>
        </div>

        {/* Stop Loss Section */}
        <div className="space-y-1.5">
          <p className="text-xs text-neutral-gray-400 font-medium">
            Stop Loss ({state.slGainMode === "roi" ? "ROI%" : "PNL"})
          </p>
          <div className="grid grid-cols-2 gap-2">
            <InputNumberControl
              label="SL Price"
              value={state.slPrice}
              onValueChange={onSlPriceChange}
            />
            <InputNumberControl
              label="Loss"
              value={state.slGain}
              onValueChange={onSlGainChange}
              trailing={
                <GainModeSelect
                  value={state.slGainMode}
                  onChange={(mode) =>
                    dispatch({ slGainMode: mode, slGain: "" })
                  }
                />
              }
            />
          </div>
        </div>

        <PositionSummary
          tpPrice={state.tpPrice}
          slPrice={state.slPrice}
          pxDecimals={position.pxDecimals}
          tpRoi={tpEstimates.roi}
          tpPnl={tpEstimates.pnl}
          slRoi={slEstimates.roi}
          slPnl={slEstimates.pnl}
        />

        <TradingButton
          label="Confirm"
          disabled={disabled}
          loading={processing}
          onClick={() =>
            setTriggerPrice({
              position,
              tpPrice: state.tpPrice,
              slPrice: state.slPrice,
              size: state.currentTab === "full" ? position.szi : state.size,
            })
          }
        />
      </div>
    </Tabs>
  );
};

type GainModeSelectProps = {
  value: GainMode;
  onChange: (value: GainMode) => void;
};

const GainModeSelect = ({ value, onChange }: GainModeSelectProps) => {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as GainMode)}>
      <SelectTrigger
        size="sm"
        className="h-6 border-0 px-0 gap-x-1 text-sm text-neutral-gray-400 rounded"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        <SelectItem value="roi">%</SelectItem>
        <SelectItem value="pnl">$</SelectItem>
      </SelectContent>
    </Select>
  );
};

const PositionDetails = ({ position }: { position: Position }) => {
  const positionSize = Math.abs(Number(position.szi));
  const entryPrice = Number(position.entryPx);
  const markPrice = Number(position.markPx);
  const liqPrice = Number(position.liquidationPx || "0");

  return (
    <div className="space-y-1 grid grid-cols-4 gap-1">
      <PositionDetailsTile label="Size" value={positionSize.toString()} />
      <PositionDetailsTile
        label="Entry Price"
        value={formatPriceToDecimal(entryPrice, position.pxDecimals)}
      />
      <PositionDetailsTile
        label="Mark Price"
        value={formatPriceToDecimal(markPrice, position.pxDecimals)}
      />
      <PositionDetailsTile
        label="Liq. Price"
        value={formatPriceToDecimal(liqPrice, position.pxDecimals, {
          useFallback: true,
        })}
      />
    </div>
  );
};

const PositionDetailsTile = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => {
  return (
    <div className="w-full space-y-0.5">
      <p className="text-xs text-neutral-gray-400">{label}</p>
      <p className="text-xs font-medium">{value}</p>
    </div>
  );
};

const PositionSummary = ({
  tpPrice,
  slPrice,
  tpRoi,
  slRoi,
  tpPnl,
  slPnl,
  pxDecimals,
}: {
  tpPrice: string;
  slPrice: string;
  tpRoi: number;
  slRoi: number;
  tpPnl: number;
  slPnl: number;
  pxDecimals: number;
}) => {
  return (
    <div className="w-full divide-y-[0.5px] divide-neutral-gray-300 bg-neutral-gray-200 p-2 rounded-lg">
      <PositionSummaryTile
        type="tp"
        pnl={tpPnl}
        roi={tpRoi}
        price={Number(tpPrice)}
        pxDecimals={pxDecimals}
      />

      {/* <div className="w-full h-[0.5px] bg-neutral-gray-300 my-1" /> */}

      <PositionSummaryTile
        type="sl"
        pnl={slPnl}
        roi={slRoi}
        price={Number(slPrice)}
        pxDecimals={pxDecimals}
      />
    </div>
  );
};

const PositionSummaryTile = ({
  price,
  pnl,
  roi,
  type,
  pxDecimals,
}: {
  price: number;
  pnl: number;
  roi: number;
  pxDecimals: number;
  type: "tp" | "sl";
}) => {
  const isTakeProfit = type === "tp";

  return (
    <div className="w-full first:pb-2 last:pt-2 space-y-0.5">
      <div className="w-full flex items-center justify-between">
        <p className="text-xs text-neutral-gray-400">
          {isTakeProfit ? "TP Price" : "SL Price"}
        </p>
        <div className="flex items-center gap-x-1">
          <p className="text-xs text-white font-medium">
            {formatPriceToDecimal(price, pxDecimals, {
              useFallback: true,
            })}
          </p>
          {!!price && (
            <span
              className={cn("text-xs font-medium text-buy", {
                "text-sell": roi < 0,
              })}
            >
              (
              {formatNumber(roi, {
                style: "percent",
                useSign: true,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              )
            </span>
          )}
        </div>
      </div>

      <div className="w-full flex items-center justify-between">
        <p className="text-xs text-neutral-gray-400">
          Expected {isTakeProfit ? "Profit" : "Loss"}
        </p>
        <p
          className={cn("text-xs font-medium text-buy", {
            "text-sell": pnl < 0,
          })}
        >
          {formatNumber(pnl, {
            style: "currency",
            useSign: true,
            useFallback: true,
          })}
        </p>
      </div>
    </div>
  );
};

export default TriggerPrice;
