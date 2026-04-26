const PERSISTED_QUERY_KEY = "persisted";

export const QUERY_KEYS = {
  persisted: PERSISTED_QUERY_KEY,
  allPerpMetas: [PERSISTED_QUERY_KEY, "allPerpMetas"],
  spotMeta: [PERSISTED_QUERY_KEY, "spotMeta"],
  perpDexs: [PERSISTED_QUERY_KEY, "perpDexs"],
  predictionMarketEvents: [PERSISTED_QUERY_KEY, "predictionMarketEvents"],
  maxBuilderFee: (address?: string) => [
    PERSISTED_QUERY_KEY,
    "maxBuilderFee",
    address,
  ],
  extraAgents: (user: string) => [PERSISTED_QUERY_KEY, "userExtraAgents", user],
  portfolio: (user: string) => [PERSISTED_QUERY_KEY, "portfolio", user],
  delegatorSummary: (user: string) => [
    PERSISTED_QUERY_KEY,
    "delegatorSummary",
    user,
  ],
  userFees: (user: string) => [PERSISTED_QUERY_KEY, "user-fees", user],
  settledOutcome: (outcome: number | null) => [
    PERSISTED_QUERY_KEY,
    "settledOutcome",
    outcome,
  ],
} as const;
