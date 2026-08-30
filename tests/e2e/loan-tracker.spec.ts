import { expect, test } from '@playwright/test';

test.describe('Home Loan Tracker E2E Suite', () => {
  test('loads public marketing landing page with pain points and auth options', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Check Public Landing Hero Heading & Pain Points
    await expect(page.locator('h1')).toContainText('Take Complete Control of Your Home Loan Repayment & Future Wealth');
    await expect(page.getByText('Try Interactive Demo')).toBeVisible();
    await expect(page.getByText('Sign In with Google')).toBeVisible();
    await expect(page.getByText('1. Silent Rate Shifts')).toBeVisible();
    await expect(page.getByText('3. Prepay vs. Invest')).toBeVisible();
  });

  test.describe('Dashboard Interactive Features', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('has_seen_onboarding_tour', 'true');
      });
      await page.reload();

      // Click "Try Interactive Demo" to open the interactive dashboard
      const demoBtn = page.getByRole('button', { name: 'Try Interactive Demo' }).first();
      await expect(demoBtn).toBeVisible();
      await demoBtn.click();
    });

    test('loads interactive dashboard with summary cards and bento layout', async ({ page }) => {
      await expect(page.getByText('Balance Left to Pay')).toBeVisible();
      await expect(page.getByText('Scheduled Monthly EMI')).toBeVisible();
      await expect(page.getByText('Projected Payoff Date')).toBeVisible();
    });

    test('allows updating initial loan parameters', async ({ page }) => {
      await expect(page.getByText('Loan Parameters & Strategy')).toBeVisible();
    });

    test('allows navigating between dedicated menu pages', async ({ page }) => {
      // Navigate to Decision Simulator
      await page.getByRole('link', { name: 'Decision Simulator' }).click();
      await expect(page.getByText('"What-If" Decision Simulator')).toBeVisible();

      // Navigate to FY Breakdown
      await page.getByRole('link', { name: 'FY Breakdown' }).click();
      await expect(page.getByText('Financial Year Statement (Apr – Mar)')).toBeVisible();

      // Navigate to Tax Strategizer
      await page.getByRole('link', { name: 'Tax Strategizer' }).click();
      await expect(page.getByText('Income Tax Savings Estimator')).toBeVisible();

      // Navigate to Schedule
      await page.getByRole('link', { name: 'Schedule' }).click();
      await expect(page.getByText('Amortization & Forecast Schedule')).toBeVisible();
    });
  });
});
