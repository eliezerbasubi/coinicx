import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";

import { GenerateAddressResponse, Operation, UnitAddress } from "@/types/unit";
import {
  PERPS_NATIVE_CHAINS_ASSETS,
  UNIT_SPOT_ASSETS,
  UnitSpotAssetToken,
} from "@/constants/unit";
import { isTestnet, UNIT_API_BASE_URL } from "@/services/transport";
import { getHLTokenImgUrl } from "@/utils/getHLTokenImgUrl";

type UseUnitFeesArgs = { enabled?: boolean };

export const useUnitFees = (args?: UseUnitFeesArgs) => {
  const { data: unitFees } = useQuery({
    queryKey: ["unit-estimate-fees"],
    staleTime: 5 * 60 * 1000,
    enabled: args?.enabled,
    queryFn: async () => {
      const response = await fetch(UNIT_API_BASE_URL + "/v2/estimate-fees", {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      return data as Record<string, any>;
    },
  });

  const getUnitFee = useCallback(
    (network: SupportedNetwork, asset: string) => {
      let networkKey: string = network;

      if (network === "solana" && asset !== "sol") {
        networkKey = "spl";
      }
      if (!unitFees) return;

      if (network === "ethereum" && asset !== "eth") {
        const fee = unitFees["ethereum-erc20"];
        return {
          withdrawFee: fee["erc20-withdrawal-fee-in-units"] as number,
          depositFee: fee["erc20-deposit-fee-in-units"] as number,
          withdrawEta: fee["erc20-withdrawal-eta"] as string,
          depositEta: fee["erc20-deposit-eta"] as string,
        };
      }

      const fee = unitFees[networkKey];

      if (!fee) return;

      return {
        withdrawFee: fee["withdrawal-fee-in-units"] as number,
        depositFee: fee["deposit-fee-in-units"] as number,
        withdrawEta: fee["withdrawalEta"] as string,
        depositEta: fee["depositEta"] as string,
      };
    },
    [unitFees],
  );

  return { unitFees, getUnitFee };
};

type SupportedNetwork =
  | "arbitrum"
  | "ethereum"
  | "bitcoin"
  | "solana"
  | "plasma"
  | "monad";

type GenerateAddressArgs = {
  network: SupportedNetwork;
  asset: string;
  dstAddr: string;
  isDeposit: boolean;
};

export const useGenerateUnitAddress = () => {
  const queryClient = useQueryClient();

  const fetcher = async (args: {
    network: string;
    asset: string;
    dstAddr: string;
    isDeposit: boolean;
  }) => {
    try {
      const [srcChain, dstChain] = args.isDeposit
        ? [args.network, "hyperliquid"]
        : ["hyperliquid", args.network];

      const response = await fetch(
        UNIT_API_BASE_URL +
          `/gen/${srcChain.toLowerCase()}/${dstChain.toLowerCase()}/${args.asset.toUpperCase()}/${args.dstAddr.toLowerCase()}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const data = (await response.json()) as GenerateAddressResponse;

      return data.address;
    } catch {
      throw new Error("Failed to generate address");
    }
  };

  const generateUnitAddress = async (args: GenerateAddressArgs) => {
    const { network, asset, dstAddr, isDeposit } = args;

    const data = await queryClient.fetchQuery({
      queryKey: ["unit-generate-address", asset, dstAddr],
      staleTime: Infinity,
      queryFn: () => fetcher({ network, asset, dstAddr, isDeposit }),
    });

    return data;
  };

  return { fetcher, generateUnitAddress };
};

type UnitOperationsResponse = {
  addresses: UnitAddress[];
  operations: Operation[];
};

export const useUnitOperations = () => {
  const { address } = useAccount();

  const { data, status } = useQuery({
    queryKey: ["unit-operations", address],
    enabled: !!address,
    queryFn: async () => {
      const response = await fetch(
        UNIT_API_BASE_URL + `/operations/${address}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const data = (await response.json()) as UnitOperationsResponse;

      return data;
    },
  });

  return {
    status,
    unitAddresses: data?.addresses || [],
    operations: data?.operations || [],
  };
};

const SPOT_ASSETS = UNIT_SPOT_ASSETS[isTestnet ? "Testnet" : "Mainnet"];

const ALL_SUPPORTED_UNIT_NETWORKS = {
  ...PERPS_NATIVE_CHAINS_ASSETS,
  ...SPOT_ASSETS,
};

export const ALL_NETWORKS_AND_ASSETS = {
  networksAndAssets: ALL_SUPPORTED_UNIT_NETWORKS,
  assets: Object.entries(ALL_SUPPORTED_UNIT_NETWORKS).reduce(
    (acc, [network, info]) => {
      Object.values(info.tokens).forEach((asset) => {
        acc[asset.symbol] = {
          network: network as SupportedNetwork,
          isPerps: info.isPerps,
          assetUrl: getHLTokenImgUrl(asset.symbol.toUpperCase(), !info.isPerps),
          networkAssetUrl:
            info.symbol !== asset.symbol
              ? (info.assetUrl ??
                getHLTokenImgUrl(info.symbol.toUpperCase(), true))
              : "",
          ...asset,
        };
      });
      return acc;
    },
    {} as Record<
      string,
      UnitSpotAssetToken & {
        network: SupportedNetwork;
        isPerps?: boolean;
        assetUrl: string;
        networkAssetUrl: string;
      }
    >,
  ),
};
