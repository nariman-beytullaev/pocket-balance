import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { PageHeader } from '@/components/page-header';
import { Screen } from '@/components/screen';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Separator } from '@/components/ui/separator';
import { Typography } from '@/components/ui/typography';
import { TEST_IDS } from '@/constants/testIds';
import { useBudget } from '@/lib/budget';
import type { CategoryType } from '@/lib/budget-store';

export default function CategoriesScreen() {
  const budget = useBudget();
  const [categoryName, setCategoryName] = useState('');
  const [categoryType, setCategoryType] = useState<CategoryType>('expense');
  const [subcategoryName, setSubcategoryName] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState('');
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [subcategoryError, setSubcategoryError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const expenseCategories = useMemo(
    () => budget.categories.filter((category) => category.type === 'expense'),
    [budget.categories],
  );
  const incomeCategories = useMemo(
    () => budget.categories.filter((category) => category.type === 'income'),
    [budget.categories],
  );

  const addCategory = () => {
    try {
      budget.addCategory({ name: categoryName, type: categoryType });
      setCategoryName('');
      setCategoryError(null);
      setSubcategoryError(null);
      setFeedback('Категория добавлена.');
    } catch (caughtError) {
      setCategoryError(caughtError instanceof Error ? caughtError.message : 'Не удалось добавить категорию.');
      setFeedback(null);
    }
  };

  const addSubcategory = () => {
    try {
      budget.addSubcategory({ categoryId: parentCategoryId, name: subcategoryName });
      setSubcategoryName('');
      setParentCategoryId('');
      setSubcategoryError(null);
      setCategoryError(null);
      setFeedback('Подкатегория добавлена.');
    } catch (caughtError) {
      setSubcategoryError(caughtError instanceof Error ? caughtError.message : 'Не удалось добавить подкатегорию.');
      setFeedback(null);
    }
  };

  return (
    <Screen scroll scrollViewProps={{ showsVerticalScrollIndicator: false }} testID={TEST_IDS.categories.screen}>
      <PageHeader
        eyebrow="Структура"
        title="Категории и подкатегории"
        description="Сначала создай понятную систему, потом транзакции будет вводить быстрее."
      />

      <Card>
        <CardHeader>
          <CardTitle>Новая категория</CardTitle>
          <CardDescription>Отдельно для расходов и доходов, чтобы баланс считался без путаницы.</CardDescription>
        </CardHeader>
        <CardContent style={styles.formSection}>
          <FieldGroup>
            <Field>
              <FieldLabel>Тип</FieldLabel>
              <NativeSelect value={categoryType} onValueChange={(nextValue) => setCategoryType(nextValue as CategoryType)}>
                <NativeSelectOption value="expense">Расход</NativeSelectOption>
                <NativeSelectOption value="income">Доход</NativeSelectOption>
              </NativeSelect>
            </Field>
            <Field>
              <FieldLabel>Название категории</FieldLabel>
              <Input
                placeholder="Например: Продукты"
                testID={TEST_IDS.categories.categoryNameInput}
                value={categoryName}
                onChangeText={(nextValue) => {
                  setCategoryName(nextValue);
                  if (categoryError) {
                    setCategoryError(null);
                  }
                }}
              />
            </Field>
          </FieldGroup>

          <FieldError>{categoryError}</FieldError>
          {feedback ? (
            <Typography variant="bodySm" colorValue="#1D8A52">
              {feedback}
            </Typography>
          ) : null}

          <Button testID={TEST_IDS.categories.addCategoryButton} onPress={addCategory}>
            Добавить категорию
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Новая подкатегория</CardTitle>
          <CardDescription>Помогает детализировать привычные траты: например, еда делится на кафе и продукты.</CardDescription>
        </CardHeader>
        <CardContent style={styles.formSection}>
          <FieldGroup>
            <Field>
              <FieldLabel>Родительская категория</FieldLabel>
              <NativeSelect
                value={parentCategoryId}
                placeholder={budget.categories.length ? 'Выбери категорию' : 'Сначала создай категорию'}
                onValueChange={setParentCategoryId}>
                {budget.categories.map((category) => (
                  <NativeSelectOption key={category.id} value={category.id}>
                    {category.name} {category.type === 'expense' ? '• расход' : '• доход'}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldDescription>Подкатегория всегда принадлежит только одной категории.</FieldDescription>
            </Field>
            <Field>
              <FieldLabel>Название подкатегории</FieldLabel>
              <Input
                placeholder="Например: Супермаркет"
                testID={TEST_IDS.categories.subcategoryNameInput}
                value={subcategoryName}
                onChangeText={(nextValue) => {
                  setSubcategoryName(nextValue);
                  if (subcategoryError) {
                    setSubcategoryError(null);
                  }
                }}
              />
            </Field>
          </FieldGroup>

          <FieldError>{subcategoryError}</FieldError>
          {feedback ? (
            <Typography variant="bodySm" colorValue="#1D8A52">
              {feedback}
            </Typography>
          ) : null}

          <Button testID={TEST_IDS.categories.addSubcategoryButton} onPress={addSubcategory}>
            Добавить подкатегорию
          </Button>
        </CardContent>
      </Card>

      <CategoryGroup title="Расходы" categories={expenseCategories} />
      <CategoryGroup title="Доходы" categories={incomeCategories} />
    </Screen>
  );
}

function CategoryGroup({
  categories,
  title,
}: {
  categories: ReturnType<typeof useBudget>['categories'];
  title: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Набор категорий, который уже готов к использованию в транзакциях.</CardDescription>
      </CardHeader>
      <CardContent style={styles.listSection}>
        {categories.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Здесь пока пусто</EmptyTitle>
              <EmptyDescription>Добавь первую категорию выше.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          categories.map((category, index) => (
            <View key={category.id} style={styles.categoryBlock}>
              <Typography weight="700">{category.name}</Typography>
              {category.subcategories.length ? (
                <View style={styles.subcategoryList}>
                  {category.subcategories.map((subcategory) => (
                    <Typography key={subcategory.id} variant="bodySm" muted>
                      • {subcategory.name}
                    </Typography>
                  ))}
                </View>
              ) : (
                <Typography variant="bodySm" muted>
                  Пока без подкатегорий
                </Typography>
              )}

              {index < categories.length - 1 ? <Separator style={styles.separator} /> : null}
            </View>
          ))
        )}
      </CardContent>
    </Card>
  );
}

const styles = StyleSheet.create({
  categoryBlock: {
    gap: 8,
  },
  formSection: {
    gap: 16,
  },
  listSection: {
    gap: 16,
  },
  separator: {
    marginTop: 8,
  },
  subcategoryList: {
    gap: 4,
  },
});
