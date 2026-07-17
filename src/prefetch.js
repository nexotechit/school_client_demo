// Prefetching utilities for React Query
import { QueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../config/api';

// Prefetch common data that users are likely to need
export const prefetchCommonData = async (queryClient) => {
  const prefetchPromises = [];

  // Prefetch public data on startup — notices, facilities, academics, achievements, banners, gallery
  const publicQueries = [
    { key: ['notices'],      url: `${API_BASE_URL}/notices` },
    { key: ['facilities'],   url: `${API_BASE_URL}/facilities` },
    { key: ['academics'],    url: `${API_BASE_URL}/academics` },
    { key: ['achievements'], url: `${API_BASE_URL}/achievements` },
    { key: ['banners'],      url: `${API_BASE_URL}/banners` },
    { key: ['gallery'],      url: `${API_BASE_URL}/gallery` },
  ];

  publicQueries.forEach(({ key, url }) => {
    prefetchPromises.push(
      queryClient.prefetchQuery({
        queryKey: key,
        queryFn: async () => {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`Failed to fetch ${key[0]}`);
          return response.json();
        },
        staleTime: 0, // Always re-fetch when a component actually mounts
      })
    );
  });

  // Prefetch user data if authenticated
  if (typeof window !== 'undefined' && localStorage.getItem('token')) {
    prefetchPromises.push(
      queryClient.prefetchQuery({
        queryKey: ['user'],
        queryFn: async () => {
          const response = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          if (!response.ok) throw new Error('Failed to fetch user');
          return response.json();
        },
        staleTime: 5 * 60 * 1000,
      })
    );
  }

  try {
    await Promise.all(prefetchPromises);
    console.log('[Prefetch] Common data prefetched successfully');
  } catch (error) {
    console.warn('[Prefetch] Some prefetching failed:', error);
  }
};

// Prefetch data for specific routes
export const prefetchRouteData = async (queryClient, route) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const routePrefetchMap = {
    '/dashboard/students': [
      { key: ['students'], url: `${API_BASE_URL}/students` },
    ],
    '/dashboard/teachers': [
      { key: ['teachers'], url: `${API_BASE_URL}/teachers` },
    ],
    '/dashboard/salary': [
      { key: ['salaries'], url: `${API_BASE_URL}/salaries` },
    ],
    '/dashboard/fees': [
      { key: ['fees'], url: `${API_BASE_URL}/fees` },
    ],
    '/dashboard/expenses': [
      { key: ['expenses'], url: `${API_BASE_URL}/expenses` },
    ],
  };

  const prefetchItems = routePrefetchMap[route];
  if (!prefetchItems) return;

  const prefetchPromises = prefetchItems.map(async ({ key, url }) => {
    try {
      await queryClient.prefetchQuery({
        queryKey: key,
        queryFn: async () => {
          const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
          const response = await fetch(url, { headers });
          if (!response.ok) throw new Error(`Failed to fetch ${key[0]}`);
          return response.json();
        },
        staleTime: 0,
      });
    } catch (error) {
      console.warn(`[Prefetch] Failed to prefetch ${key[0]}:`, error);
    }
  });

  await Promise.all(prefetchPromises);
  console.log(`[Prefetch] Route data prefetched for ${route}`);
};

// Prefetch on hover (for links/buttons that navigate to data-heavy pages)
export const prefetchOnHover = (queryClient, route) => {
  return () => prefetchRouteData(queryClient, route);
};

// Prefetch on focus (for accessibility)
export const prefetchOnFocus = (queryClient, route) => {
  return () => prefetchRouteData(queryClient, route);
};

// Background sync utility
export const setupBackgroundSync = (queryClient) => {
  // Sync when coming back online
  const handleOnline = () => {
    console.log('[Background Sync] Back online, syncing data...');
    // Invalidate and refetch stale queries
    queryClient.invalidateQueries({
      refetchType: 'active', // Only refetch active queries
    });
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('online', handleOnline);

    // Also sync periodically when online
    const syncInterval = setInterval(() => {
      if (navigator.onLine) {
        queryClient.invalidateQueries({
          refetchType: 'none', // Don't refetch, just mark as stale
        });
      }
    }, 5 * 60 * 1000); // Every 5 minutes

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      clearInterval(syncInterval);
    };
  }
};

// Optimistic update helpers
export const createOptimisticUpdate = (queryClient, queryKey, updateFn) => {
  return async (variables) => {
    // Cancel any outgoing refetches
    await queryClient.cancelQueries({ queryKey });

    // Snapshot the previous value
    const previousData = queryClient.getQueryData(queryKey);

    // Optimistically update to the new value
    queryClient.setQueryData(queryKey, (old) => updateFn(old, variables));

    // Return a context object with the snapshotted value
    return { previousData };
  };
};

export const rollbackOptimisticUpdate = (queryClient, queryKey, context) => {
  if (context?.previousData) {
    queryClient.setQueryData(queryKey, context.previousData);
  }
};