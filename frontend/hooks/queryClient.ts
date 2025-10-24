import { QueryClient } from "@tanstack/react-query";
import {
  persistQueryClient,
  Persister,
  PersistedClient,
} from "@tanstack/react-query-persist-client";
import localforage from "localforage";

// ✅ Create QueryClient
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // replaces cacheTime
      staleTime: 1000 * 60, // 1 minute
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
            networkMode: "offlineFirst", // 👈 THIS IS IMPORTANT

    },
  },
});

// ✅ Correctly typed persister for localforage
const persister: Persister = {
  persistClient: async (client) => {
    await localforage.setItem("REACT_QUERY_OFFLINE_CACHE", client);
  },
  restoreClient: async (): Promise<PersistedClient | undefined> => {
    const client = await localforage.getItem<PersistedClient>(
      "REACT_QUERY_OFFLINE_CACHE"
    );
    // Explicitly ensure we return correct type
    return client ?? undefined;
  },
  removeClient: async () => {
    await localforage.removeItem("REACT_QUERY_OFFLINE_CACHE");
  },
};

// ✅ Apply persistence
persistQueryClient({
  queryClient,
  persister,
  maxAge: 1000 * 60 * 60 * 24, // 1 day
});

export default queryClient;
