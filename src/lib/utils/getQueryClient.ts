import {
  defaultShouldDehydrateQuery,
  isServer,
  Query,
  QueryClient,
} from "@tanstack/react-query";

import { QUERY_KEYS } from "../constants/queryKeys";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
        staleTime: 60 * 1000,
      },
      dehydrate: {
        // include pending queries in dehydration
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
        shouldRedactErrors: () => {
          // We should not catch Next.js server errors
          // as that's how Next.js detects dynamic pages
          // so we cannot redact them.
          // Next.js also automatically redacts errors for us
          // with better digests.
          return false;
        },
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

const MAX_RECENT = 500;

/**
 * Filter function for determining which queries should be persisted.
 * It ignores unrelated query groups and keeps only the top 500 most recent
 * "settledOutcome" queries to prevent the cache from growing indefinitely.
 *
 * @param query The query to check
 * @param client The query client
 * @returns true if the query should be persisted, false otherwise
 */
export function isPersistedQuery(query: Query, client: QueryClient) {
  const settledOutcomeQueryKey = QUERY_KEYS.settledOutcome(null)[1];

  // Ignore unrelated query groups or queries without persisted meta
  if (query.queryKey[0] !== QUERY_KEYS.persisted && !query.meta?.persist)
    return false;

  // Allow everything except the specific "settledOutcome" case
  if (query.queryKey[1] !== settledOutcomeQueryKey) return true;

  // Only consider successful queries
  if (query.state.status !== "success") return false;

  // Get all successful "settledOutcome" queries
  const successfulQueries = client
    .getQueryCache()
    .findAll({ queryKey: [QUERY_KEYS.persisted, settledOutcomeQueryKey] })
    .filter((q) => q.state.status === "success")
    .sort((a, b) => b.state.dataUpdatedAt - a.state.dataUpdatedAt);

  // Determine the cutoff timestamp (top 500 most recent)
  const cutoffQuery =
    successfulQueries[Math.min(successfulQueries.length, MAX_RECENT) - 1];
  const cutoffTime = cutoffQuery?.state.dataUpdatedAt ?? 0;

  // Keep only queries newer than or equal to the cutoff
  return query.state.dataUpdatedAt >= cutoffTime;
}
