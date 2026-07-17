'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect } from 'react';
import { prefetchCommonData, setupBackgroundSync } from '../prefetch';
import { LanguageProvider } from '../contexts/LanguageContext';

// Create a client
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Minimal stale time for immediate UI updates
        staleTime: 0, // Always consider data stale for fresh data
        gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
        refetchOnWindowFocus: true, // Refetch when window regains focus
        refetchOnMount: true, // Refetch when component mounts
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors
          if (error?.status >= 400 && error?.status < 500) {
            return false;
          }
          return failureCount < 3;
        },
        networkMode: 'online', // Changed from offlineFirst for immediate updates
      },
      mutations: {
        retry: false,
        networkMode: 'online', // Changed from offlineFirst for immediate updates
      },
    },
  });
}

let browserQueryClient;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export default function Providers({ children }) {
  // NOTE: Avoid useState when initializing the query client if you don't
  // have a suspense boundary between this and the code that may suspend
  // because React will throw away the client on the initial render if
  // it suspends and there is no boundary
  const queryClient = getQueryClient();

  // Prefetch common data and setup background sync on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Prefetch common data
      prefetchCommonData(queryClient);

      // Setup background sync
      const cleanup = setupBackgroundSync(queryClient);

      return cleanup;
    }
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </LanguageProvider>
    </QueryClientProvider>
  );
}