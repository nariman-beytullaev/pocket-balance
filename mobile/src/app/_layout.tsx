import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useState } from 'react';

import { BudgetProvider } from '@/lib/budget';

export default function RootLayout() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            staleTime: 30_000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <BudgetProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </BudgetProvider>
    </QueryClientProvider>
  );
}
