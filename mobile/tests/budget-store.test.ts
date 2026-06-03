import { expect, test } from 'bun:test';

import {
  calculateCurrentBalance,
  createDefaultBudgetState,
  groupCategories,
  parseBudgetState,
  summarizeBudget,
} from '../src/lib/budget-store';

test('default budget state ships with starter categories and subcategories', () => {
  const state = createDefaultBudgetState();
  const grouped = groupCategories(state);

  expect(state.version).toBe(1);
  expect(grouped.length).toBeGreaterThan(2);
  expect(grouped.some((category) => category.type === 'expense' && category.subcategories.length > 0)).toBe(true);
  expect(grouped.some((category) => category.type === 'income' && category.subcategories.length > 0)).toBe(true);
});

test('parseBudgetState falls back to defaults for invalid payloads', () => {
  const parsed = parseBudgetState({ version: 999 });

  expect(parsed.version).toBe(1);
  expect(parsed.categories.length).toBeGreaterThan(0);
});

test('budget summary combines starting balance with income and expenses', () => {
  const state = createDefaultBudgetState();
  state.startingBalance = 1000;
  state.transactions = [
    {
      amount: 2500,
      categoryId: 'income-salary',
      id: 'income-1',
      note: 'Salary',
      occurredAt: '2026-06-03T10:00:00.000Z',
      subcategoryId: 'income-salary-main',
      type: 'income',
    },
    {
      amount: 700,
      categoryId: 'expense-food',
      id: 'expense-1',
      note: 'Groceries',
      occurredAt: '2026-06-03T12:00:00.000Z',
      subcategoryId: 'expense-food-groceries',
      type: 'expense',
    },
  ];

  expect(calculateCurrentBalance(state)).toBe(2800);
  expect(summarizeBudget(state, new Date('2026-06-15T00:00:00.000Z'))).toEqual({
    currentBalance: 2800,
    monthlyExpenses: 700,
    monthlyIncome: 2500,
    transactionCount: 2,
  });
});
