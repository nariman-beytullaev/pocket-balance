import { expect, test } from 'bun:test';

import { TEST_IDS } from '../src/constants/testIds';

test('navigation test IDs cover tab and details flows', () => {
  expect(TEST_IDS.tabs.overviewTab).toBe('tabs.overview');
  expect(TEST_IDS.tabs.transactionsTab).toBe('tabs.transactions');
  expect(TEST_IDS.tabs.categoriesTab).toBe('tabs.categories');
  expect(TEST_IDS.details.openButton).toBe('details.open-button');
  expect(TEST_IDS.details.backButton).toBe('details.back-button');
  expect(TEST_IDS.details.screen).toBe('details.screen');
  expect(TEST_IDS.screen.backButton).toBe('screen.back-button');
  expect(TEST_IDS.overview.screen).toBe('overview.screen');
  expect(TEST_IDS.transactions.screen).toBe('transactions.screen');
  expect(TEST_IDS.categories.screen).toBe('categories.screen');
});
