import {
  TabList,
  TabSlot,
  Tabs,
  TabTrigger,
  type TabListProps,
  type TabTriggerSlotProps,
} from 'expo-router/ui';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '@/components/ui/typography';
import { TEST_IDS } from '@/constants/testIds';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function AppTabs() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Spacing.two);
  const slotStyle = StyleSheet.flatten([styles.slot, { paddingBottom: 56 + bottomPadding }]);
  const tabBarStyle = StyleSheet.flatten([
    styles.tabBar,
    {
      backgroundColor: colors.background,
      borderTopColor: colors.backgroundElement,
      paddingBottom: bottomPadding,
    },
  ]);

  return (
    <Tabs style={styles.root}>
      <TabSlot style={slotStyle} />
      <TabList asChild>
        <BottomTabList style={tabBarStyle}>
          <TabTrigger name="index" href="/(tabs)" asChild>
            <TabButton
              icon={{ ios: 'wallet.pass.fill', android: 'account_balance_wallet', web: 'account_balance_wallet' }}
              testID={TEST_IDS.tabs.overviewTab}>
              Balance
            </TabButton>
          </TabTrigger>
          <TabTrigger name="transactions" href="/transactions" asChild>
            <TabButton
              icon={{ ios: 'arrow.left.arrow.right.circle.fill', android: 'swap_horiz', web: 'swap_horiz' }}
              testID={TEST_IDS.tabs.transactionsTab}>
              Transactions
            </TabButton>
          </TabTrigger>
          <TabTrigger name="categories" href="/categories" asChild>
            <TabButton
              icon={{ ios: 'square.grid.3x3.topleft.filled', android: 'category', web: 'category' }}
              testID={TEST_IDS.tabs.categoriesTab}>
              Categories
            </TabButton>
          </TabTrigger>
        </BottomTabList>
      </TabList>
    </Tabs>
  );
}

function BottomTabList(props: TabListProps) {
  return <View {...props} />;
}

type TabButtonProps = TabTriggerSlotProps & {
  icon: SymbolViewProps['name'];
};

function TabButton({ children, icon, isFocused, ...props }: TabButtonProps) {
  const colors = useTheme();
  const color = isFocused ? colors.text : colors.textSecondary;

  return (
    <Pressable {...props} style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}>
      <SymbolView name={icon} size={22} tintColor={color} />
      <Typography colorValue={color} variant="caption" weight="700">
        {children}
      </Typography>
    </Pressable>
  );
}

const styles = {
  pressed: {
    opacity: 0.72,
  },
  root: {
    flex: 1,
    minHeight: '100vh' as unknown as ViewStyle['minHeight'],
  },
  slot: {
    minHeight: '100vh' as unknown as ViewStyle['minHeight'],
  },
  tabBar: {
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    bottom: 0,
    flexDirection: 'row',
    gap: Spacing.two,
    justifyContent: 'center',
    left: 0,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    position: 'fixed' as ViewStyle['position'],
    right: 0,
  },
  tabButton: {
    alignItems: 'center',
    flex: 1,
    gap: Spacing.one,
    justifyContent: 'center',
    minHeight: 48,
  },
} satisfies Record<string, ViewStyle>;
