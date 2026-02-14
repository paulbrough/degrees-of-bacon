import { test, expect } from "@playwright/test";

test.describe("Auth", () => {
  test("sign in page renders", async ({ page }) => {
    await page.goto("/auth/signin");
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /sign up/i })).toBeVisible();
  });

  test("sign up page renders", async ({ page }) => {
    await page.goto("/auth/signup");
    await expect(page.getByRole("heading", { name: /sign up/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /sign up/i })).toBeVisible();
    // "Sign in" link in the page body (not the header)
    await expect(page.locator("main").getByRole("link", { name: /sign in/i })).toBeVisible();
  });

  test("unauthenticated watchlist redirects to sign in", async ({ page }) => {
    await page.goto("/watchlist");
    // Should redirect to sign in
    await expect(page).toHaveURL(/\/auth\/signin/);
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
  });

  test("sign in link visible in header", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible();
  });

  test("public pages work without auth", async ({ page }) => {
    // Home page
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /degrees of bacon/i })).toBeVisible();

    // Search
    await page.goto("/search?q=batman");
    await expect(page.getByRole("heading", { name: /results/i })).toBeVisible();

    // Movie detail
    await page.goto("/movie/550");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Compare
    await page.goto("/compare");
    await expect(page.getByRole("heading", { name: /compare/i })).toBeVisible();
  });

  test("sign in shows error for invalid credentials", async ({ page }) => {
    await page.goto("/auth/signin");

    await page.getByLabel(/email/i).fill("fake@example.com");
    await page.getByLabel(/password/i).fill("wrongpassword");
    await page.getByRole("button", { name: /sign in/i }).click();

    // Should show error
    await expect(page.getByText(/invalid/i).or(page.getByText(/error/i))).toBeVisible({ timeout: 10000 });
  });
});
