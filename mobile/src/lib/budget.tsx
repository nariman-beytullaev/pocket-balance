import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

import {
  calculateCurrentBalance,
  createDefaultBudgetState,
  findCategoryName,
  findSubcategoryName,
  groupCategories,
  makeBudgetId,
  parseBudgetState,
  sortTransactions,
  summarizeBudget,
  type BudgetState,
  type BudgetTransaction,
  type CategoryType,
  type GroupedBudgetCategory,
} from '@/lib/budget-store';

type AddCategoryInput = {
  name: string;
  type: CategoryType;
};

type AddSubcategoryInput = {
  categoryId: string;
  name: string;
};

type AddTransactionInput = {
  amount: number;
  categoryId: string;
  note?: string;
  subcategoryId?: string | null;
  type: CategoryType;
};

type BudgetContextValue = {
  addCategory: (input: AddCategoryInput) => void;
  addSubcategory: (input: AddSubcategoryInput) => void;
  addTransaction: (input: AddTransactionInput) => void;
  categories: GroupedBudgetCategory[];
  currentBalance: number;
  isBootstrapping: boolean;
  removeTransaction: (transactionId: string) => void;
  setStartingBalance: (amount: number) => void;
  startingBalance: number;
  summary: ReturnType<typeof summarizeBudget>;
  transactions: Array<
    BudgetTransaction & {
      categoryName: string;
      subcategoryName: string | null;
    }
  >;
};

const budgetStorageKey = 'pocket_balance_budget_v1';
const BudgetContext = createContext<BudgetContextValue | null>(null);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BudgetState | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const stored = await getStoredBudgetState();
      const nextState = stored ? parseBudgetState(JSON.parse(stored)) : createDefaultBudgetState();

      if (!cancelled) {
        setState(nextState);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!state) {
      return;
    }

    void persistBudgetState(state);
  }, [state]);

  const value = useMemo<BudgetContextValue>(() => {
    const safeState = state ?? createDefaultBudgetState();
    const grouped = groupCategories(safeState);
    const summary = summarizeBudget(safeState);

    return {
      addCategory: ({ name, type }) => {
        const normalizedName = name.trim();

        if (!normalizedName) {
          throw new Error('Category name is required.');
        }

        setState((current) => {
          const previous = current ?? createDefaultBudgetState();
          return {
            ...previous,
            categories: [
              ...previous.categories,
              {
                createdAt: new Date().toISOString(),
                id: makeBudgetId('category'),
                name: normalizedName,
                type,
              },
            ],
          };
        });
      },
      addSubcategory: ({ categoryId, name }) => {
        const normalizedName = name.trim();

        if (!normalizedName) {
          throw new Error('Subcategory name is required.');
        }

        setState((current) => {
          const previous = current ?? createDefaultBudgetState();
          const categoryExists = previous.categories.some((category) => category.id === categoryId);

          if (!categoryExists) {
            throw new Error('Choose a parent category first.');
          }

          return {
            ...previous,
            subcategories: [
              ...previous.subcategories,
              {
                categoryId,
                createdAt: new Date().toISOString(),
                id: makeBudgetId('subcategory'),
                name: normalizedName,
              },
            ],
          };
        });
      },
      addTransaction: ({ amount, categoryId, note, subcategoryId, type }) => {
        if (!Number.isFinite(amount) || amount <= 0) {
          throw new Error('Enter an amount greater than zero.');
        }

        setState((current) => {
          const previous = current ?? createDefaultBudgetState();
          const category = previous.categories.find((item) => item.id === categoryId);

          if (!category) {
            throw new Error('Choose a category.');
          }

          if (category.type !== type) {
            throw new Error('Category type does not match the transaction type.');
          }

          const normalizedSubcategoryId = subcategoryId?.trim() ? subcategoryId : null;

          if (normalizedSubcategoryId) {
            const subcategory = previous.subcategories.find((item) => item.id === normalizedSubcategoryId);

            if (!subcategory || subcategory.categoryId !== categoryId) {
              throw new Error('Choose a valid subcategory.');
            }
          }

          return {
            ...previous,
            transactions: [
              {
                amount,
                categoryId,
                id: makeBudgetId('transaction'),
                note: note?.trim() ?? '',
                occurredAt: new Date().toISOString(),
                subcategoryId: normalizedSubcategoryId,
                type,
              },
              ...previous.transactions,
            ],
          };
        });
      },
      categories: grouped,
      currentBalance: calculateCurrentBalance(safeState),
      isBootstrapping: state === null,
      removeTransaction: (transactionId) => {
        setState((current) => {
          const previous = current ?? createDefaultBudgetState();
          return {
            ...previous,
            transactions: previous.transactions.filter((transaction) => transaction.id !== transactionId),
          };
        });
      },
      setStartingBalance: (amount) => {
        if (!Number.isFinite(amount)) {
          throw new Error('Enter a valid starting balance.');
        }

        setState((current) => ({
          ...(current ?? createDefaultBudgetState()),
          startingBalance: amount,
        }));
      },
      startingBalance: safeState.startingBalance,
      summary,
      transactions: sortTransactions(safeState.transactions).map((transaction) => ({
        ...transaction,
        categoryName: findCategoryName(safeState, transaction.categoryId),
        subcategoryName: findSubcategoryName(safeState, transaction.subcategoryId),
      })),
    };
  }, [state]);

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
}

export function useBudget() {
  const context = useContext(BudgetContext);

  if (!context) {
    throw new Error('useBudget must be used within BudgetProvider');
  }

  return context;
}

async function getStoredBudgetState() {
  if (Platform.OS === 'web') {
    return window.localStorage.getItem(budgetStorageKey);
  }

  return SecureStore.getItemAsync(budgetStorageKey);
}

async function persistBudgetState(state: BudgetState) {
  const serialized = JSON.stringify(state);

  if (Platform.OS === 'web') {
    window.localStorage.setItem(budgetStorageKey, serialized);
    return;
  }

  await SecureStore.setItemAsync(budgetStorageKey, serialized);
}
