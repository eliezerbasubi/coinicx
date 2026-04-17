import { useMemo, useState } from "react";
import { OrderParameters } from "@nktkas/hyperliquid";
import { toast } from "sonner";

import { hlExchangeClient } from "@/lib/services/transport";
import { useShallowAccountTransactStore } from "@/lib/store/trade/account-transact";
import { useShallowInstrumentStore } from "@/lib/store/trade/instrument";
import { useShallowUserTradeStore } from "@/lib/store/trade/user-trade";
import { useAgentClient } from "@/hooks/useAgentClient";
import { useAssetMetas } from "@/features/trade/hooks/useAssetMetas";
import { useFeeRate } from "@/features/trade/hooks/useUserFees";
import {
  buildSpotAssetId,
  formatSize,
  getPriceDecimals,
  parseOrderPriceWithSlippage,
  roundToDecimals,
} from "@/features/trade/utils";
import { buildOrder, getBuilder } from "@/features/trade/utils/orders";

const toastId = "transfer-and-swap";
const SWAP_MAX_SLIPPAGE = 0.01; // 1%

export const useTransferAndSwap = () => {
  const { getAgentClient } = useAgentClient();
  const quote = useShallowAccountTransactStore((s) => s.swapQuoteAsset);

  const [inputAmount, setInputAmount] = useState("");
  const [processing, setProcessing] = useState(false);

  const feeRate = useFeeRate({ isMarket: true, isSpot: true });

  const base = "USDC";

  const { perpsWithdrawable, spotUSDCBalance } = useShallowUserTradeStore(
    (s) => {
      const spotUSDC = s.spotBalances.find((b) => b.token === 0);

      return {
        perpsWithdrawable: Number(
          s.allDexsClearinghouseState?.withdrawable ?? "0",
        ),
        spotUSDCBalance: spotUSDC
          ? Number(spotUSDC.total) - Number(spotUSDC.hold)
          : 0,
      };
    },
  );

  const { spotMeta, tokenNamesToUniverseIndex } = useAssetMetas();
  const spotAssetCtxs = useShallowInstrumentStore((s) => s.spotAssetCtxs);

  const quoteSpotInfo = useMemo(() => {
    if (!spotMeta || !tokenNamesToUniverseIndex || !quote) return null;

    const universeIndex = tokenNamesToUniverseIndex.get(quote)?.get(base);
    if (universeIndex === undefined) return null;

    const universe = spotMeta.universe[universeIndex];
    if (!universe) return null;

    const baseTokenMeta = spotMeta.tokens[universe.tokens[0]];

    return {
      coin: universe.name,
      assetId: buildSpotAssetId(universe.index),
      szDecimals: baseTokenMeta?.szDecimals ?? 0,
    };
  }, [spotMeta, tokenNamesToUniverseIndex, quote]);

  const midPrice = quoteSpotInfo
    ? Number(spotAssetCtxs[quoteSpotInfo.coin]?.midPx ?? "0")
    : 0;

  const maxAmount = roundToDecimals(
    perpsWithdrawable + spotUSDCBalance,
    2,
    "floor",
  );
  const parsedInput = parseFloat(inputAmount) || 0;
  const outputAmount =
    midPrice > 0 ? roundToDecimals(parsedInput / midPrice, 2, "floor") : 0;

  const insufficientBalance = parsedInput > maxAmount;
  const disabled = insufficientBalance || parsedInput < 10 || processing;

  const label = insufficientBalance
    ? "Insufficient balance"
    : parsedInput > 0 && parsedInput < 10
      ? "Minimum order size is 10 USDC"
      : "Swap";

  // Buy fees are not applied to Buy side of spot trades
  // So we calculate the fee using only the maker fee rate
  // 0.2 is for scaling the pair as we are dealing with stablecoin pairs
  // @see https://hyperliquid.gitbook.io/hyperliquid-docs/trading/fees#fee-formula-for-developers
  const estimatedFees = outputAmount * feeRate.rate * 0.2;

  const executeSwap = async () => {
    try {
      if (!quoteSpotInfo) {
        throw new Error(`No spot pair found for ${quote}/${base}`);
      }

      if (parsedInput <= 0) {
        throw new Error("Enter a valid amount");
      }

      if (parsedInput > maxAmount) {
        throw new Error("Insufficient balance");
      }

      if (midPrice <= 0) {
        throw new Error("Unable to determine price. Please try again.");
      }

      if (parsedInput < 10) {
        throw new Error("Minimum order size is 10 USDC");
      }

      setProcessing(true);

      // Check if spot balance covers the input amount
      // If not, transfer the deficit from perps to spot first
      if (spotUSDCBalance < parsedInput) {
        const transferAmount = parsedInput - spotUSDCBalance;

        toast.loading(
          `Transferring ${roundToDecimals(transferAmount, 2, "floor")} ${base} from Perps to Spot`,
          { id: toastId },
        );

        try {
          const exchClient = await hlExchangeClient();

          await exchClient.usdClassTransfer({
            amount: transferAmount,
            toPerp: false,
          });
        } catch (error) {
          throw new Error(
            error instanceof Error
              ? `Transfer failed: ${error.message}`
              : "Failed to transfer funds from Perps to Spot",
          );
        }
      }

      toast.loading(`Swapping ${inputAmount} ${base} to ${quote}`, {
        id: toastId,
      });

      // Build the swap order
      const priceDecimals = getPriceDecimals(
        midPrice,
        quoteSpotInfo.szDecimals,
        true,
      );

      const entryPrice = parseOrderPriceWithSlippage({
        entryPrice: midPrice,
        isBuyOrder: true,
        slippage: SWAP_MAX_SLIPPAGE,
        decimals: priceDecimals,
      });

      const size = parsedInput / midPrice;

      const order = buildOrder({
        assetId: quoteSpotInfo.assetId,
        side: "buy",
        type: "market",
        price: entryPrice.toString(),
        size: formatSize(size, quoteSpotInfo.szDecimals),
        reduceOnly: false,
        isMarket: true,
      });

      const exchClient = await getAgentClient();
      const builder = getBuilder(quoteSpotInfo.assetId);

      const { response } = await exchClient.order({
        orders: [order],
        grouping: "na" as OrderParameters["grouping"],
        builder,
      });

      let message = "Swap completed successfully";

      for (const status of response.data.statuses) {
        if (typeof status === "object") {
          if ("filled" in status) {
            const filled = status.filled;
            message = `Swapped ${filled.totalSz} ${quote} for ${inputAmount} USDC`;
            break;
          }
          if ("resting" in status) {
            message = "Swap incomplete. Order resting on the orderbook";
            break;
          }
        }
      }

      toast.success(message, { id: toastId });
      setInputAmount("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to swap";
      toast.error(message, { id: toastId });
    } finally {
      setProcessing(false);
    }
  };

  return {
    maxAmount,
    inputAmount,
    outputAmount,
    estimatedFees,
    feeRate,
    midPrice,
    processing,
    quote,
    base,
    disabled,
    label,
    setInputAmount,
    executeSwap,
  };
};
