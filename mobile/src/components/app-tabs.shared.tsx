import { Tabs as RouterTabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '@/components/ui/typography';
import { TEST_IDS } from '@/constants/testIds';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function AppTabs() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = 56 + Math.max(insets.bottom, Spacing.two);

  return (
    <RouterTabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
        tabBarActiveTintColor: colors.text,
        tabBarHideOnKeyboard: true,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarItemStyle: styles.tabBarItem,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.backgroundElement,
            height: tabBarHeight,
            paddingBottom: Math.max(insets.bottom, Spacing.two),
          },
        ],
      }}>
      <RouterTabs.Screen
        name="index"
        options={{
          title: 'Balance',
          tabBarLabel: ({ color }) => (
            <Typography colorValue={color} variant="caption" weight="700">
              Balance
            </Typography>
          ),
          tabBarButtonTestID: TEST_IDS.tabs.overviewTab,
          tabBarIcon: ({ color, size }) => (
            <SymbolView
              name={{ ios: 'wallet.pass.fill', android: 'account_balance_wallet', web: 'account_balance_wallet' }}
              size={size}
              tintColor={color}
            />
          ),
        }}
      />
      <RouterTabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarLabel: ({ color }) => (
            <Typography colorValue={color} variant="caption" weight="700">
              Transactions
            </Typography>
          ),
          tabBarButtonTestID: TEST_IDS.tabs.transactionsTab,
          tabBarIcon: ({ color, size }) => (
            <SymbolView
              name={{ ios: 'arrow.left.arrow.right.circle.fill', android: 'swap_horiz', web: 'swap_horiz' }}
              size={size}
              tintColor={color}
            />
          ),
        }}
      />
      <RouterTabs.Screen
        name="categories"
        options={{
          title: 'Categories',
          tabBarLabel: ({ color }) => (
            <Typography colorValue={color} variant="caption" weight="700">
              Categories
            </Typography>
          ),
          tabBarButtonTestID: TEST_IDS.tabs.categoriesTab,
          tabBarIcon: ({ color, size }) => (
            <SymbolView
              name={{ ios: 'square.grid.3x3.topleft.filled', android: 'category', web: 'category' }}
              size={size}
              tintColor={color}
            />
          ),
        }}
      />
    </RouterTabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    elevation: 0,
    paddingTop: Spacing.two,
    shadowOpacity: 0,
  },
  tabBarItem: {
    paddingVertical: Spacing.one,
  },
});
