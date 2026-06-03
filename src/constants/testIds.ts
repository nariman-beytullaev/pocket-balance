export const TEST_IDS = {
  details: {
    backButton: 'details.back-button',
    openButton: 'details.open-button',
    screen: 'details.screen',
  },
  screen: {
    backButton: 'screen.back-button',
  },
  categories: {
    addCategoryButton: 'categories.add-category-button',
    addSubcategoryButton: 'categories.add-subcategory-button',
    categoryNameInput: 'categories.category-name-input',
    screen: 'categories.screen',
    subcategoryNameInput: 'categories.subcategory-name-input',
  },
  overview: {
    saveStartingBalanceButton: 'overview.save-starting-balance-button',
    screen: 'overview.screen',
    startingBalanceInput: 'overview.starting-balance-input',
  },
  tabs: {
    categoriesTab: 'tabs.categories',
    overviewTab: 'tabs.overview',
    transactionsTab: 'tabs.transactions',
  },
  transactions: {
    addButton: 'transactions.add-button',
    amountInput: 'transactions.amount-input',
    noteInput: 'transactions.note-input',
    screen: 'transactions.screen',
  },
} as const;
