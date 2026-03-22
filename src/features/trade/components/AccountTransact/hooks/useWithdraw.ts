import { useMemo, useReducer } from "react";
import { toast } from "sonner";
import { useWebHaptics } from "web-haptics/react";
import { zeroAddress } from "viem";
import { useAccount } from "wagmi";

import { ERROR_NAME } from "@/lib/constants/errors";
import { hlExchangeClient, hlInfoClient } from "@/lib/services/transport";
import { useAccountTransactStore } from "@/lib/store/trade/account-transact";
import { useShallowInstrumentStore } from "@/lib/store/trade/instrument";
import { useShallowUserTradeStore } from "@/lib/store/trade/user-trade";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import { isValidAddress } from "@/lib/utils/isValidAddress";
import { useMetaAndAssetCtxs } from "@/features/trade/hooks/useMetaAndAssetCtxs";
import {
  ALL_NETWORKS_AND_ASSETS,
  useGenerateUnitAddress,
  useUnitFees,
} from "@/features/trade/hooks/useUnitProtocol";
import { getTokenDisplayName } from "@/features/trade/utils/getTokenDisplayName";

const toastId = "withdraw-account";

type State = {
  open: boolean;
  processing: boolean;
  amount: string;
  token: string;
  receipientAddress: string;
};
const { assets, networksAndAssets } = ALL_NETWORKS_AND_ASSETS;

export const useWithdraw = () => {
  const haptic = useWebHaptics();
  const { getUnitFee } = useUnitFees();
  const { generateUnitAddress } = useGenerateUnitAddress();
  const { tokensToSpotId } = useMetaAndAssetCtxs();
  const spotAssetCtxs = useShallowInstrumentStore((s) => s.spotAssetCtxs);

  const [state, dispatch] = useReducer(
    (prev: State, next: Partial<State>) => ({ ...prev, ...next }),
    {
      open: false,
      processing: false,
      amount: "",
      token: "USDC",
      receipientAddress: "",
    },
  );

  const { address } = useAccount();

  const { withdrawable, spotBalances } = useShallowUserTradeStore((s) => ({
    withdrawable: s.allDexsClearinghouseState?.withdrawable || "0",
    spotBalances: s.spotBalances,
  }));

  const balances = useMemo(() => {
    return spotBalances.reduce(
      (acc, curr) => {
        if (Number(curr.total)) {
          const spotId = tokensToSpotId?.get(curr.token)?.get(0);
          const balance = Number(curr.total) - Number(curr.hold);

          const displayName = getTokenDisplayName(curr.coin);

          if (spotId) {
            const ctx = spotAssetCtxs[spotId];

            if (ctx) {
              acc[displayName] = {
                balance,
                balanceNtl: balance * Number(ctx.markPx),
              };
            } else {
              acc[displayName] = { balance, balanceNtl: Number(curr.entryNtl) };
            }
          }
        }

        return acc;
      },
      {} as Record<string, { balanceNtl: number; balance: number }>,
    );
  }, [spotBalances, tokensToSpotId, spotAssetCtxs]);

  const tokens = useMemo(() => {
    return Object.values(assets).map((asset) => {
      if (asset.network !== "arbitrum") {
        const spotTokenData = balances[asset.symbol.toUpperCase()];

        return {
          ...asset,
          balance: spotTokenData?.balance?.toString() ?? "0",
          balanceNtl: spotTokenData?.balanceNtl.toString() ?? "0",
        };
      } else {
        return {
          ...asset,
          balance: withdrawable,
          balanceNtl: withdrawable,
        };
      }
    });
  }, [balances, withdrawable]);

  const currentAssetInfo = useMemo(() => {
    const token = assets[state.token.toUpperCase()];

    if (token.network === "arbitrum") {
      return {
        ...token,
        balance: withdrawable,
        balanceNtl: withdrawable,
      };
    }

    const spotTokenData = balances[token.symbol.toUpperCase()];

    return {
      ...token,
      balance: spotTokenData?.balance?.toString() ?? "0",
      balanceNtl: spotTokenData?.balanceNtl.toString() ?? "0",
    };
  }, [balances, withdrawable, state.token]);

  const currentNetworkInfo = networksAndAssets[currentAssetInfo.network];

  const unitFees = getUnitFee(currentAssetInfo.network, state.token);
  const withdrawFee = currentAssetInfo.isPerps ? 1 : unitFees?.withdrawFee || 0;

  const parsedAmount = parseFloat(state.amount || "0");

  const label = useMemo(() => {
    if (parsedAmount && parsedAmount < Number(currentAssetInfo.minAmount)) {
      return {
        text: `Minimum withdraw is ${currentAssetInfo.minAmount} ${currentAssetInfo.symbol}`,
        disabled: true,
      };
    }

    if (
      parsedAmount &&
      parsedAmount > Number(currentAssetInfo.balance) - withdrawFee
    ) {
      return {
        text: "Insufficient token to withdraw",
        disabled: true,
      };
    }

    if (
      state.receipientAddress &&
      !isValidAddress(currentAssetInfo.network, state.receipientAddress)
    ) {
      return {
        text: "Invalid wallet address",
        disabled: true,
      };
    }
    return { text: "Withdraw", disabled: false };
  }, [
    parsedAmount,
    state.receipientAddress,
    currentAssetInfo.minAmount,
    currentAssetInfo.symbol,
    withdrawFee,
  ]);

  const amountToReceive = Math.max(parsedAmount - withdrawFee, 0);

  const onPasteAddress = async (e?: React.ClipboardEvent<HTMLInputElement>) => {
    try {
      let text = "";

      if (e) {
        text = e.clipboardData.getData("text");
      } else {
        text = await navigator.clipboard.readText();
      }

      if (!isValidAddress(currentAssetInfo.network, text)) {
        toast.warning("Invalid wallet address", { id: toastId });

        e?.preventDefault();
        return;
      }

      // Avoid updating state here as it will be updated in onChange event
      if (!e) {
        dispatch({ receipientAddress: text });
      }
    } catch {
      toast.warning("Clipboard is blocked by the browser");
    }
  };

  const withdraw = async () => {
    if (parsedAmount <= 0 || !address) {
      toast.warning("Insufficient token to withdraw", { id: toastId });
      return;
    }

    try {
      dispatch({ processing: true });

      const formattedAmount = formatNumber(parsedAmount, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 8,
      });

      toast.loading(
        `Withdrawing ${formattedAmount} ${currentAssetInfo.symbol}`,
        {
          id: toastId,
        },
      );

      const exchClient = await hlExchangeClient();

      if (currentAssetInfo.isPerps) {
        await exchClient.withdraw3({
          amount: state.amount,
          destination: state.receipientAddress,
        });
      } else {
        const unitAddress = await generateUnitAddress({
          network: currentAssetInfo.network,
          asset: state.token,
          dstAddr: state.receipientAddress,
          isDeposit: false,
        });

        const preTransferCheck = await hlInfoClient.preTransferCheck({
          user: unitAddress,
          source: zeroAddress,
        });

        if (preTransferCheck.isSanctioned) {
          throw new Error("Recipient address is sanctioned");
        }

        if (!currentAssetInfo.spotSendTokenName) {
          throw new Error("Token meta not found");
        }

        await exchClient.spotSend({
          token: currentAssetInfo.spotSendTokenName,
          amount: state.amount,
          destination: unitAddress,
        });
      }

      toast.success(
        `${formattedAmount} ${currentAssetInfo.symbol} withdrawn successfully`,
        { id: toastId },
      );
      haptic.trigger("success");

      useAccountTransactStore.getState().closeAccountTransact();
    } catch (error: any) {
      let message = "Failed to withdraw tokens";

      if (
        error.name === ERROR_NAME.UserRejectedRequestError ||
        error.cause?.name === ERROR_NAME.UserRejectedRequestError
      ) {
        message = "User rejected transaction signature";
      }

      if (error.name === "ApiRequestError") {
        message = error.message;
      }

      toast.error(message, { id: toastId });
      haptic.trigger("error");
    } finally {
      dispatch({ processing: false });
    }
  };

  return {
    amountToReceive,
    currentNetworkInfo,
    currentAssetInfo,
    unitFees,
    withdrawFee,
    label,
    tokens,
    state,
    dispatch,
    onPasteAddress,
    withdraw,
  };
};
