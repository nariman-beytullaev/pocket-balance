import { Stack } from 'expo-router';

import { BudgetProvider } from '@/lib/budget';

export default function RootLayout() {
  return (
    <BudgetProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </BudgetProvider>
  );
}
