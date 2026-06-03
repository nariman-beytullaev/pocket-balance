import { z } from 'zod';

const categoryTypeSchema = z.enum(['income', 'expense']);

const budgetCategorySchema = z.object({
  createdAt: z.string(),
  id: z.string(),
  name: z.string(),
  type: categoryTypeSchema,
});

const budgetSubcategorySchema = z.object({
  categoryId: z.string(),
  createdAt: z.string(),
  id: z.string(),
  name: z.string(),
});

const budgetTransactionSchema = z.object({
  amount: z.number().positive(),
  categoryId: z.string(),
  id: z.string(),
  note: z.string(),
  occurredAt: z.string(),
  subcategoryId: z.string().nullable(),
  type: categoryTypeSchema,
});

const budgetStateSchema = z.object({
  categories: z.array(budgetCategorySchema),
  startingBalance: z.number(),
  subcategories: z.array(budgetSubcategorySchema),
  transactions: z.array(budgetTransactionSchema),
  version: z.literal(1),
});

export type CategoryType = z.infer<typeof categoryTypeSchema>;
export type BudgetCategory = z.infer<typeof budgetCategorySchema>;
export type BudgetSubcategory = z.infer<typeof budgetSubcategorySchema>;
export type BudgetTransaction = z.infer<typeof budgetTransactionSchema>;
export type BudgetState = z.infer<typeof budgetStateSchema>;

export type GroupedBudgetCategory = BudgetCategory & {
  subcategories: BudgetSubcategory[];
};

export type BudgetSummary = {
  currentBalance: number;
  monthlyExpenses: number;
  monthlyIncome: number;
  transactionCount: number;
};

type DefaultCategorySeed = {
  id: string;
  name: string;
  subcategories: Array<{
    id: string;
    name: string;
  }>;
  type: CategoryType;
};

const defaultCategorySeeds: DefaultCategorySeed[] = [
  {
    id: 'expense-food',
    name: 'Food',
    subcategories: [
      { id: 'expense-food-groceries', name: 'Groceries' },
      { id: 'expense-food-cafe', name: 'Cafe' },
    ],
    type: 'expense',
  },
  {
    id: 'expense-transport',
    name: 'Transport',
    subcategories: [
      { id: 'expense-transport-metro', name: 'Metro' },
      { id: 'expense-transport-taxi', name: 'Taxi' },
    ],
    type: 'expense',
  },
  {
    id: 'expense-home',
    name: 'Home',
    subcategories: [
      { id: 'expense-home-rent', name: 'Rent' },
      { id: 'expense-home-bills', name: 'Bills' },
    ],
    type: 'expense',
  },
  {
    id: 'income-salary',
    name: 'Salary',
    subcategories: [
      { id: 'income-salary-main', name: 'Main job' },
      { id: 'income-salary-bonus', name: 'Bonus' },
    ],
    type: 'income',
  },
  {
    id: 'income-side',
    name: 'Side income',
    subcategories: [
      { id: 'income-side-freelance', name: 'Freelance' },
      { id: 'income-side-refund', name: 'Refund' },
    ],
    type: 'income',
  },
];

export function createDefaultBudgetState(): BudgetState {
  const createdAt = new Date().toISOString();

  return {
    categories: defaultCategorySeeds.map(({ id, name, type }) => ({
      createdAt,
      id,
      name,
      type,
    })),
    startingBalance: 0,
    subcategories: defaultCategorySeeds.flatMap(({ id: categoryId, subcategories }) =>
      subcategories.map((subcategory) => ({
        categoryId,
        createdAt,
        id: subcategory.id,
        name: subcategory.name,
      })),
    ),
    transactions: [],
    version: 1,
  };
}

export function parseBudgetState(input: unknown): BudgetState {
  const parsed = budgetStateSchema.safeParse(input);
  return parsed.success ? parsed.data : createDefaultBudgetState();
}

export function calculateCurrentBalance(state: BudgetState) {
  return state.startingBalance + calculateNetTransactions(state.transactions);
}

export function summarizeBudget(state: BudgetState, now = new Date()): BudgetSummary {
  const month = now.getUTCMonth();
  const year = now.getUTCFullYear();

  let monthlyIncome = 0;
  let monthlyExpenses = 0;

  for (const transaction of state.transactions) {
    const occurredAt = new Date(transaction.occurredAt);

    if (occurredAt.getUTCMonth() !== month || occurredAt.getUTCFullYear() !== year) {
      continue;
    }

    if (transaction.type === 'income') {
      monthlyIncome += transaction.amount;
    } else {
      monthlyExpenses += transaction.amount;
    }
  }

  return {
    currentBalance: calculateCurrentBalance(state),
    monthlyExpenses,
    monthlyIncome,
    transactionCount: state.transactions.length,
  };
}

export function groupCategories(state: BudgetState): GroupedBudgetCategory[] {
  return state.categories
    .map((category) => ({
      ...category,
      subcategories: state.subcategories
        .filter((subcategory) => subcategory.categoryId === category.id)
        .sort((left, right) => left.name.localeCompare(right.name)),
    }))
    .sort((left, right) => {
      if (left.type !== right.type) {
        return left.type === 'expense' ? -1 : 1;
      }

      return left.name.localeCompare(right.name);
    });
}

export function findCategoryName(state: BudgetState, categoryId: string) {
  return state.categories.find((category) => category.id === categoryId)?.name ?? 'Unknown category';
}

export function findSubcategoryName(state: BudgetState, subcategoryId: string | null) {
  if (!subcategoryId) {
    return null;
  }

  return state.subcategories.find((subcategory) => subcategory.id === subcategoryId)?.name ?? null;
}

export function sortTransactions(transactions: BudgetTransaction[]) {
  return [...transactions].sort((left, right) => right.occurredAt.localeCompare(left.occurredAt));
}

export function makeBudgetId(prefix: string) {
  const random = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  return `${prefix}-${random}`;
}

function calculateNetTransactions(transactions: BudgetTransaction[]) {
  return transactions.reduce((total, transaction) => {
    return total + (transaction.type === 'income' ? transaction.amount : -transaction.amount);
  }, 0);
}
