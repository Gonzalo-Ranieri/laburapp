"use client"

import { QueryClient, QueryClientProvider as QCProvider } from "@tanstack/react-query"
import type * as React from "react"

const queryClient = new QueryClient()

export function QueryClientProvider({ children }: { children: React.ReactNode }) {
  return <QCProvider client={queryClient}>{children}</QCProvider>
}
