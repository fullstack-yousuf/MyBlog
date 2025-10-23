"use client";

import React, { useEffect } from "react";
import {
  QueryClientProvider,
  focusManager,
  onlineManager,
} from "@tanstack/react-query";
import {
  PersistQueryClientProvider,
  Persister,
  PersistedClient,
} from "@tanstack/react-query-persist-client";
import queryClient from "../hooks/queryClient";
import localforage from "localforage";

// ✅ Setup online/offline detection (only in browser)
if (typeof window !== "undefined") {
  window.addEventListener("online", () => onlineManager.setOnline(true));
  window.addEventListener("offline", () => onlineManager.setOnline(false));
  window.addEventListener("focus", () => focusManager.setFocused(true));
  window.addEventListener("blur", () => focusManager.setFocused(false));
}

// ✅ Strongly typed localforage persister
const persister: Persister = {
  persistClient: async (client) =>{
    await localforage.setItem("REACT_QUERY_OFFLINE_CACHE", client)
  return},

  restoreClient: async (): Promise<PersistedClient | undefined> => {
    const cache = await localforage.getItem<PersistedClient>(
      "REACT_QUERY_OFFLINE_CACHE"
    );
    return cache ?? undefined;
  },

  removeClient: async () =>
    await localforage.removeItem("REACT_QUERY_OFFLINE_CACHE"),
};

export function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // 🧠 Log persisted cache once (for debugging only)
  useEffect(() => {
    localforage.getItem("REACT_QUERY_OFFLINE_CACHE").then((cache) => {
      if (cache) console.log("🧠 Restored offline cache:", cache);
    });
  }, []);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24, // 1 day
      }}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </PersistQueryClientProvider>
  );
}

// "use client";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { useState } from "react";

// export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
//   const [client] = useState(() => new QueryClient());
//   return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
// }
