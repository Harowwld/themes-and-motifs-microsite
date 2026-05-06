"use client";

import type { Query } from "@tanstack/react-query";
import { PersistQueryClientProvider, type PersistQueryClientOptions } from "@tanstack/react-query-persist-client";
import { queryClient } from "../lib/queryClient";
import { idbPersister } from "../lib/persister";

const persistOptions: Omit<PersistQueryClientOptions, "queryClient"> = {
  persister: idbPersister,
  // Dehydrate all queries - keeps previously loaded content cached
  dehydrateOptions: {
    shouldDehydrateQuery: (query: Query) => {
      // Don't persist auth-related queries
      const queryKey = query.queryKey[0] as string;
      if (queryKey?.includes("auth") || queryKey?.includes("session")) {
        return false;
      }
      // Persist all other queries (vendors, moments, etc.)
      return true;
    },
  },
  // Max age for persisted cache: 24 hours
  maxAge: 1000 * 60 * 60 * 24,
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={persistOptions}
      onSuccess={() => {
        // Resume mutations that were pending before reload
        queryClient.resumePausedMutations().then(() => {
          queryClient.invalidateQueries();
        });
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
