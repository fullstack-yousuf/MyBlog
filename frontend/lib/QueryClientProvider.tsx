// src/providers/ReactQueryProvider.tsx
"use client";

import React, { useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstac k/react-query-devtools";
import queryClient from "@/hooks/queryClient";

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // Small delay so React Query can restore cache from localforage
        await new Promise((r) => setTimeout(r, 300));
      } catch (err) {
        console.warn("⚠️ Failed to restore query cache:", err);
      } finally {
        setIsReady(true);
      }
    })();
  }, []);



  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
