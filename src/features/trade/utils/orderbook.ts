import { PriceLevel, Tick } from "@/types/orderbook";

import { formatPriceToDecimal } from "./formatting";
import { getPriceDecimals, getPriceSigFigs } from "./prices";

type L2BookTick = {
  nSigFigs: number | null;
  mantissa: number;
};

export const mapCumulativeDepthVisualizer = (
  levels: PriceLevel[],
): PriceLevel[] => {
  let sumAmount = 0;

  return levels.map((level) => {
    sumAmount += Number(level.sz);

    return { ...level, total: sumAmount };
  });
};

export const mapAmountDepthVisualizer = (
  levels: PriceLevel[],
): PriceLevel[] => {
  return levels.map((level) => ({ px: level.px, sz: level.sz }));
};

const getTickValue = (tick: L2BookTick) => {
  return tick.nSigFigs === null ? -1 : 10 * tick.nSigFigs + tick.mantissa;
};

export const getNSigFigsAndMantissa = (tickValue: number | null) => {
  if (tickValue === null || tickValue === -1) {
    return { nSigFigs: null, mantissa: null };
  }

  const nSigFigs = Math.floor(tickValue / 10);
  const mantissa = tickValue % 10;

  // Allowed values are 2 and 5 for mantissa when nSigFigs is 5
  if (nSigFigs !== 5 || mantissa === 1) {
    return { nSigFigs, mantissa: null };
  }

  return { nSigFigs, mantissa };
};

export const generateTicks = (
  price: number,
  szDecimals: number,
  isSpot: boolean,
) => {
  const ticks: Array<Tick> = [];
  const decimals = getPriceDecimals(price, szDecimals, isSpot);

  const maxSigFigs = getPriceSigFigs(price, szDecimals, isSpot);

  const magnitudeShift = Math.max(0, Math.floor(Math.log10(price)) - 4);

  if (magnitudeShift > 0) {
    ticks.push({
      value: getTickValue({ nSigFigs: null, mantissa: 1 }),
      label: "1",
    });
  }
  for (let sigFigs = maxSigFigs; sigFigs >= 2; sigFigs--) {
    const exponent = maxSigFigs - sigFigs - decimals + magnitudeShift;

    const mantissas = sigFigs === 5 ? [1, 2, 5] : [1];

    for (const m of mantissas) {
      ticks.push({
        value: getTickValue({
          mantissa: m,
          nSigFigs: sigFigs,
        }),
        label: formatPriceToDecimal(
          m * Math.pow(10, exponent),
          Math.max(-exponent, 0),
        ),
      });
    }
  }

  return ticks;
};
