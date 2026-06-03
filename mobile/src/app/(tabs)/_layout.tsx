import AppTabs from '@/components/app-tabs';
import { ScreenLoader } from '@/components/screen-states';
import { useBudget } from '@/lib/budget';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function TabsLayout() {
  const budget = useBudget();

  if (budget.isBootstrapping) {
    return <ScreenLoader />;
  }

  return <AppTabs />;
}
