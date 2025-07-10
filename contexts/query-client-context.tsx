"use client"

import { QueryClient, QueryClientProvider as RQProvider } from "@tanstack/react-query"
import type * as React from "react"

/* singleton query-client so the cache survives fast-refresh */
const queryClient = (globalThis as unknown as { __laburappQc?: QueryClient }).__laburappQc ?? new QueryClient()

if (!(globalThis as any).__laburappQc) {
  ;(globalThis as any).__laburappQc = queryClient
}

export function QueryClientProvider({ children }: { children: React.ReactNode }) {
  return <RQProvider client={queryClient}>{children}</RQProvider>
}
