import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { PageHeader } from '@/components/page-header';
import { Screen } from '@/components/screen';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Typography } from '@/components/ui/typography';
import { TEST_IDS } from '@/constants/testIds';
import { useBudget } from '@/lib/budget';
import type { CategoryType } from '@/lib/budget-store';

export default function TransactionsScreen() {
  const budget = useBudget();
  const [type, setType] = useState<CategoryType>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const categories = useMemo(
    () => budget.categories.filter((category) => category.type === type),
    [budget.categories, type],
  );
  const activeCategory = categories.find((category) => category.id === categoryId) ?? null;
  const subcategories = activeCategory?.subcategories ?? [];

  const addTransaction = () => {
    const parsedAmount = Number.parseFloat(amount.replace(',', '.'));

    try {
      budget.addTransaction({
        amount: parsedAmount,
        categoryId,
        note,
        subcategoryId: subcategoryId || null,
        type,
      });

      setAmount('');
      setCategoryId('');
      setSubcategoryId('');
      setNote('');
      setError(null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Не удалось сохранить транзакцию.');
    }
  };

  return (
    <Screen scroll scrollViewProps={{ showsVerticalScrollIndicator: false }} testID={TEST_IDS.transactions.screen}>
      <PageHeader
        eyebrow="Операции"
        title="Записывай деньги по мере движения"
        description="Доходы и расходы сразу меняют итоговый баланс."
      />

      <Card>
        <CardHeader>
          <CardTitle>Новая транзакция</CardTitle>
          <CardDescription>Сначала выбери тип, потом категорию и при желании подкатегорию.</CardDescription>
        </CardHeader>
        <CardContent style={styles.formSection}>
          <FieldGroup>
            <Field>
              <FieldLabel>Тип</FieldLabel>
              <NativeSelect value={type} onValueChange={(nextValue) => {
                setType(nextValue as CategoryType);
                setCategoryId('');
                setSubcategoryId('');
              }}>
                <NativeSelectOption value="expense">Расход</NativeSelectOption>
                <NativeSelectOption value="income">Доход</NativeSelectOption>
              </NativeSelect>
            </Field>

            <Field>
              <FieldLabel>Сумма</FieldLabel>
              <Input
                keyboardType="decimal-pad"
                placeholder="0"
                testID={TEST_IDS.transactions.amountInput}
                value={amount}
                onChangeText={setAmount}
              />
            </Field>

            <Field>
              <FieldLabel>Категория</FieldLabel>
              <NativeSelect
                value={categoryId}
                placeholder={categories.length ? 'Выбери категорию' : 'Сначала создай категорию'}
                onValueChange={(nextValue) => {
                  setCategoryId(nextValue);
                  setSubcategoryId('');
                }}>
                {categories.map((category) => (
                  <NativeSelectOption key={category.id} value={category.id}>
                    {category.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>

            <Field>
              <FieldLabel>Подкатегория</FieldLabel>
              <NativeSelect
                value={subcategoryId}
                placeholder={subcategories.length ? 'Необязательно' : 'Нет подкатегорий'}
                onValueChange={setSubcategoryId}>
                {subcategories.map((subcategory) => (
                  <NativeSelectOption key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldDescription>Можно оставить пустым, если детализировать не нужно.</FieldDescription>
            </Field>

            <Field>
              <FieldLabel>Комментарий</FieldLabel>
              <Textarea
                placeholder="Например: обед, такси, зарплата"
                testID={TEST_IDS.transactions.noteInput}
                value={note}
                onChangeText={setNote}
              />
            </Field>
          </FieldGroup>

          {error ? (
            <Typography variant="bodySm" colorValue="#C43D3D">
              {error}
            </Typography>
          ) : null}

          <Button testID={TEST_IDS.transactions.addButton} onPress={addTransaction}>
            Сохранить транзакцию
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>История</CardTitle>
          <CardDescription>Удаление записи сразу пересчитывает баланс.</CardDescription>
        </CardHeader>
        <CardContent style={styles.listSection}>
          {budget.transactions.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>История пока пустая</EmptyTitle>
                <EmptyDescription>Первая сохраненная транзакция появится здесь.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            budget.transactions.map((transaction, index) => (
              <View key={transaction.id} style={styles.transactionRow}>
                <View style={styles.transactionCopy}>
                  <Typography weight="700">
                    {transaction.note || transaction.subcategoryName || transaction.categoryName}
                  </Typography>
                  <Typography variant="bodySm" muted>
                    {transaction.categoryName}
                    {transaction.subcategoryName ? ` • ${transaction.subcategoryName}` : ''}
                  </Typography>
                  <Typography variant="caption" muted>
                    {new Date(transaction.occurredAt).toLocaleString('ru-RU')}
                  </Typography>
                </View>

                <View style={styles.transactionMeta}>
                  <Typography
                    weight="700"
                    colorValue={transaction.type === 'income' ? '#1D8A52' : '#C43D3D'}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </Typography>
                  <Button
                    size="xs"
                    variant="outline"
                    onPress={() => budget.removeTransaction(transaction.id)}>
                    Удалить
                  </Button>
                </View>

                {index < budget.transactions.length - 1 ? <Separator style={styles.separator} /> : null}
              </View>
            ))
          )}
        </CardContent>
      </Card>
    </Screen>
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
  separator: {
    marginTop: 8,
  },
  transactionCopy: {
    flex: 1,
    gap: 4,
  },
  transactionMeta: {
    alignItems: 'flex-end',
    gap: 8,
  },
  transactionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});
