import { LAYER_ONE_TOKENS } from "@/features/trade/constants/layer-one-tokens";

export const getTokenDisplayName = (token: string) => {
  return LAYER_ONE_TOKENS[token]?.displayName ?? token;
};
