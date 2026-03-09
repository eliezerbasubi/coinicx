import { useMemo, useReducer } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { erc20Abi, parseUnits } from "viem";
import { useAccount, useConfig } from "wagmi";
import {
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "wagmi/actions";

import { CHAINS_CONFIG_ENV } from "@/config/chains";
import { ERROR_NAME } from "@/constants/errors";
import { useTokenBalance } from "@/features/trade/hooks/useTokenBalance";
import {
  ALL_NETWORKS_AND_ASSETS,
  useGenerateUnitAddress,
  useUnitFees,
  useUnitOperations,
} from "@/features/trade/hooks/useUnitProtocol";
import { useAccountTransactStore } from "@/store/trade/account-transact";

type State = {
  amount: string;
  token: string;
  copied: boolean;
  processing: boolean;
};

const { assets, networksAndAssets } = ALL_NETWORKS_AND_ASSETS;

const toastId = "deposit-account";

export const useDeposit = () => {
  const { address, isConnected } = useAccount();
  const config = useConfig();
  const { tokenBalance } = useTokenBalance();

  const { unitAddresses } = useUnitOperations();
  const { fetcher } = useGenerateUnitAddress();

  const [state, dispatch] = useReducer(
    (prev: State, next: Partial<State>) => ({ ...prev, ...next }),
    {
      amount: "",
      token: "USDC",
      copied: false,
      processing: false,
    },
  );

  const currentAssetInfo = assets[state.token];
  const currentNetworkInfo = networksAndAssets[currentAssetInfo.network];
  const minDepositAmount =
    currentAssetInfo.network !== "arbitrum" ? currentAssetInfo.minAmount : 5;

  const unitOperationAddress = useMemo(
    () =>
      unitAddresses.find(
        (unitAddress) =>
          unitAddress.sourceCoinType === currentAssetInfo.network &&
          unitAddress.destinationChain === "hyperliquid",
      ),
    [unitAddresses, currentAssetInfo.network],
  );

  const { data: generatedAddress, status } = useQuery({
    queryKey: ["generate-unit-address", currentAssetInfo.network],
    queryFn: () =>
      fetcher({
        network: currentAssetInfo.network,
        asset: state.token,
        dstAddr: address!,
        isDeposit: true,
      }),
    enabled:
      !unitOperationAddress &&
      currentAssetInfo.network !== "arbitrum" &&
      !!address,
  });

  const { getUnitFee } = useUnitFees({
    enabled: currentAssetInfo.network !== "arbitrum",
  });

  const parsedAmount = parseFloat(state.amount);

  const label = useMemo(() => {
    if (parsedAmount && parsedAmount < minDepositAmount)
      return `Minimum deposit is ${minDepositAmount} USDC`;
    return "Deposit";
  }, [parsedAmount]);

  const disabled =
    !state.amount || parsedAmount < minDepositAmount || state.processing;

  const depositAddress =
    unitOperationAddress?.address || generatedAddress || "";

  const unitFees = getUnitFee(currentAssetInfo.network, currentAssetInfo.name);

  const bridgeDeposit = async () => {
    const bridgeAddress = CHAINS_CONFIG_ENV.arbitrum.contracts.bridge2.address;
    const usdcAddress = CHAINS_CONFIG_ENV.arbitrum.contracts.token.address;
    const depositAmount = parseUnits(state.amount, 6);

    const { request } = await simulateContract(config, {
      abi: erc20Abi,
      functionName: "transfer",
      args: [bridgeAddress, depositAmount],
      address: usdcAddress,
    });

    const hash = await writeContract(config, request);

    toast.loading(`Depositing ${state.amount} USDC into your account`, {
      id: toastId,
    });

    const receipt = await waitForTransactionReceipt(config, { hash });

    if (receipt.status === "reverted") {
      throw new Error("Transaction reverted");
    }
  };

  const deposit = async () => {
    if (currentAssetInfo.network !== "arbitrum") {
      useAccountTransactStore.getState().closeAccountTransact();
      return;
    }

    if (!parsedAmount || !address) {
      toast.warning("Insufficient token to deposit", { id: toastId });
      return;
    }

    try {
      dispatch({ processing: true });

      toast.loading("Waiting for confirmation", { id: toastId });

      await bridgeDeposit();

      toast.success(`${state.amount} USDC deposited successful`, {
        id: toastId,
      });

      useAccountTransactStore.getState().closeAccountTransact();
    } catch (error: any) {
      let message = "Failed to deposit tokens";

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
    } finally {
      dispatch({ processing: false });
    }
  };

  return {
    currentAssetInfo,
    currentNetworkInfo,
    depositAddress,
    disabled,
    dispatch,
    label,
    isConnected,
    generateStatus: status,
    minDepositAmount,
    unitFees,
    tokenBalance,
    tokens: Object.values(assets),
    state,
    deposit,
  };
};
