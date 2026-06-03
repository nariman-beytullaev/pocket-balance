import { StyleSheet, View } from 'react-native';
import { useMemo, useState } from 'react';

import { PageHeader } from '@/components/page-header';
import { Screen } from '@/components/screen';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Typography } from '@/components/ui/typography';
import { TEST_IDS } from '@/constants/testIds';
import { useBudget } from '@/lib/budget';

export default function OverviewScreen() {
  const budget = useBudget();
  const [startingBalanceDraft, setStartingBalanceDraft] = useState(String(budget.startingBalance));
  const [error, setError] = useState<string | null>(null);

  const recentTransactions = useMemo(() => budget.transactions.slice(0, 5), [budget.transactions]);

  const saveStartingBalance = () => {
    const parsed = Number.parseFloat(startingBalanceDraft.replace(',', '.'));

    if (!Number.isFinite(parsed)) {
      setError('Введите корректный стартовый баланс.');
      return;
    }

    setError(null);
    budget.setStartingBalance(parsed);
    setStartingBalanceDraft(String(parsed));
  };

  return (
    <Screen scroll scrollViewProps={{ showsVerticalScrollIndicator: false }} testID={TEST_IDS.overview.screen}>
      <PageHeader
        eyebrow="Pocket Balance"
        title="Твой баланс под контролем"
        description="Локальный трекер расходов без регистрации и без облака."
      />

      <View style={styles.summaryGrid}>
        <SummaryCard label="Текущий баланс" value={formatCurrency(budget.summary.currentBalance)} emphasis />
        <SummaryCard label="Доходы за месяц" value={formatCurrency(budget.summary.monthlyIncome)} />
        <SummaryCard label="Расходы за месяц" value={formatCurrency(budget.summary.monthlyExpenses)} />
        <SummaryCard label="Всего операций" value={String(budget.summary.transactionCount)} />
      </View>

      <Card>
        <CardHeader>
          <CardTitle>Стартовый баланс</CardTitle>
          <CardDescription>Меняется отдельно от транзакций и участвует в расчете общего остатка.</CardDescription>
        </CardHeader>
        <CardContent style={styles.formSection}>
          <FieldGroup>
            <Field>
              <FieldLabel>Сумма</FieldLabel>
              <Input
                keyboardType="decimal-pad"
                placeholder="0"
                testID={TEST_IDS.overview.startingBalanceInput}
                value={startingBalanceDraft}
                onChangeText={setStartingBalanceDraft}
              />
              <FieldDescription>Можно задать текущий остаток на момент начала учета.</FieldDescription>
            </Field>
          </FieldGroup>

          {error ? (
            <Typography variant="bodySm" colorValue="#C43D3D">
              {error}
            </Typography>
          ) : null}

          <Button testID={TEST_IDS.overview.saveStartingBalanceButton} onPress={saveStartingBalance}>
            Сохранить баланс
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Последние операции</CardTitle>
          <CardDescription>Пять последних записей, чтобы быстро понять, что изменило баланс.</CardDescription>
        </CardHeader>
        <CardContent style={styles.listSection}>
          {recentTransactions.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>Пока пусто</EmptyTitle>
                <EmptyDescription>Добавь первую транзакцию на вкладке операций.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            recentTransactions.map((transaction, index) => (
              <View key={transaction.id} style={styles.row}>
                <View style={styles.rowCopy}>
                  <Typography weight="600">{transaction.note || transaction.subcategoryName || transaction.categoryName}</Typography>
                  <Typography variant="bodySm" muted>
                    {transaction.categoryName}
                    {transaction.subcategoryName ? ` • ${transaction.subcategoryName}` : ''}
                  </Typography>
                </View>
                <Typography
                  weight="700"
                  colorValue={transaction.type === 'income' ? '#1D8A52' : '#C43D3D'}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </Typography>
                {index < recentTransactions.length - 1 ? <Separator style={styles.separator} /> : null}
              </View>
            ))
          )}
        </CardContent>
      </Card>
    </Screen>
  );
}

function SummaryCard({ emphasis, label, value }: { emphasis?: boolean; label: string; value: string }) {
  return (
    <Card size="sm" style={[styles.summaryCard, emphasis && styles.summaryCardEmphasis]}>
      <CardContent style={styles.summaryCardContent}>
        <Typography variant="bodySm" muted={!emphasis}>
          {label}
        </Typography>
        <Typography variant={emphasis ? 'h3' : 'h5'} weight="700">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('ru-RU', {
    currency: 'RUB',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value);
}

const styles = StyleSheet.create({
  formSection: {
    gap: 16,
  },
  listSection: {
    gap: 16,
  },
  row: {
    gap: 8,
  },
  rowCopy: {
    gap: 4,
  },
  separator: {
    marginTop: 8,
  },
  summaryCard: {
    flexBasis: '47%',
    flexGrow: 1,
    minHeight: 124,
  },
  summaryCardContent: {
    gap: 10,
  },
  summaryCardEmphasis: {
    minHeight: 144,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});
