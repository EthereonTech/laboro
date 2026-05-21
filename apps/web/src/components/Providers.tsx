'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 5 * 60_000,      // dados frescos por 5 min
        gcTime: 15 * 60_000,        // cache por 15 min
        refetchOnWindowFocus: false, // não refaz fetch ao trocar de aba
        refetchOnReconnect: false,   // não refaz fetch ao reconectar
      },
    },
  }))
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
