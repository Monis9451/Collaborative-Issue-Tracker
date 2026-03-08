'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, type ReactNode } from 'react'

/**
 * Creates a per-request QueryClient.
 *
 * We instantiate it inside useState so each browser tab/session
 * gets its own isolated cache — essential for App Router.
 *
 * Default options chosen for this project:
 *  - staleTime 60 s  → prevents unnecessary re-fetches on tab focus
 *  - retry 1         → fail fast on auth errors / bad queries
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,  // 60 seconds
        retry: 1,
      },
    },
  })
}

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  // useState ensures we only create one QueryClient per component instance
  const [queryClient] = useState(() => makeQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Floating devtools panel — only appears in development */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
