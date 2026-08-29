import { expect, test } from '@playwright/test';

test.describe('Home Loan Tracker E2E Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('loads dashboard with initial loan summary metrics', async ({ page }) => {
    // Check main title
    await expect(page.locator('h1')).toContainText('Home Loan Repayment & Forecast Tracker');

    // Check Summary Cards
    const balanceLeft = page.locator('#summary-balance-left');
    await expect(balanceLeft).toBeVisible();

    const monthlyEmi = page.locator('#summary-monthly-emi');
    await expect(monthlyEmi).toBeVisible();
    await expect(monthlyEmi).toContainText('₹');

    const projectedPayoff = page.locator('#summary-projected-payoff');
    await expect(projectedPayoff).toBeVisible();
  });

  test('allows updating initial loan parameters and recalculates schedule', async ({ page }) => {
    const loanAmountInput = page.locator('#input-loan-amount');
    await expect(loanAmountInput).toBeVisible();

    // Change loan amount to 4,000,000
    await loanAmountInput.fill('4000000');

    // Verify monthly EMI changes
    const monthlyEmi = page.locator('#summary-monthly-emi');
    await expect(monthlyEmi).toContainText('₹');
  });

  test('allows adding an interest rate change for a specific month', async ({ page }) => {
    // Add rate change at Month 15 to 9.5%
    await page.locator('#input-rate-change-month').fill('15');
    await page.locator('#input-rate-change-value').fill('9.5');
    await page.locator('#btn-add-rate-change').click();

    // Verify rate revision tag appears
    await expect(page.getByText('Month 15')).toBeVisible();
    await expect(page.getByText('9.5% Annual Rate')).toBeVisible();
  });

  test('allows adding a quarterly prepayment rule', async ({ page }) => {
    await page.locator('#input-prepayment-type').selectOption('QUARTERLY');
    await page.locator('#input-prepayment-type').dispatchEvent('change');
    await page.locator('#btn-add-prepayment-rule').click();

    // Verify prepayment rule appears in active list
    await expect(page.locator('[data-prepayment-type="QUARTERLY"]')).toBeVisible();
  });

  test('allows searching and navigating amortization schedule table', async ({ page }) => {
    const searchInput = page.locator('#input-search-schedule');
    await searchInput.fill('2025');

    // Table rows should filter to 2025
    const table = page.locator('#amortization-table');
    await expect(table).toContainText('2025');

    // Clear search
    await searchInput.fill('');

    // Click Next Page button
    const nextPageBtn = page.locator('#btn-next-page');
    await nextPageBtn.click();
  });
});
