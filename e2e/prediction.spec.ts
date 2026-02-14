import { test, expect } from "@playwright/test";

test.describe("Where Do I Know Them From?", () => {
  test("button visible on person page", async ({ page }) => {
    // Brad Pitt (TMDB ID 287)
    await page.goto("/person/287");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const button = page.getByRole("button", { name: /where do i know them from/i });
    await expect(button).toBeVisible();
  });

  test("clicking button shows prediction results", async ({ page }) => {
    await page.goto("/person/287"); // Brad Pitt
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const button = page.getByRole("button", { name: /where do i know them from/i });
    await button.click();

    // Should show loading state first
    await expect(page.getByText(/analyzing filmography/i)).toBeVisible();

    // Then show results (wait for loading to finish)
    await expect(page.getByRole("button", { name: /hide results/i })).toBeVisible({ timeout: 15000 });
  });

  test("confirmed tier shows watch list matches", async ({ page }) => {
    // Use Se7en (id 807) — a movie unique to this test to avoid parallel test interference
    await page.goto("/movie/807");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Wait for watchlist button to finish loading
    await expect(page.getByRole("button", { name: /add to watch list|on watch list/i })).toBeVisible();

    // Add if not already on list
    const addButton = page.getByRole("button", { name: /add to watch list/i });
    if (await addButton.isVisible()) {
      const [response] = await Promise.all([
        page.waitForResponse((r) => r.url().includes("/api/watchlist") && r.request().method() === "POST"),
        addButton.click(),
      ]);
      expect([201, 409]).toContain(response.status());
    }
    await expect(page.getByRole("button", { name: /on watch list/i })).toBeVisible();

    // Go to Brad Pitt's page (he's in Se7en)
    await page.goto("/person/287");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Click prediction button
    await page.getByRole("button", { name: /where do i know them from/i }).click();

    // Wait for results
    await expect(page.getByRole("button", { name: /hide results/i })).toBeVisible({ timeout: 15000 });

    // Should show Confirmed tier with Se7en
    await expect(page.getByText("Confirmed")).toBeVisible();
    await expect(page.getByText("Confirmed").locator("..").locator("..").getByText("Se7en").first()).toBeVisible();

    // Cleanup
    await page.goto("/movie/807");
    await expect(page.getByRole("button", { name: /add to watch list|on watch list/i })).toBeVisible();
    const onListButton = page.getByRole("button", { name: /on watch list/i });
    if (await onListButton.isVisible()) {
      const [deleteRes] = await Promise.all([
        page.waitForResponse((r) => r.url().includes("/api/watchlist") && r.request().method() === "DELETE"),
        onListButton.click(),
      ]);
      expect(deleteRes.status()).toBe(200);
    }
  });

  test("shows add more message with small watch list", async ({ page }) => {
    await page.goto("/person/287"); // Brad Pitt
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await page.getByRole("button", { name: /where do i know them from/i }).click();
    await expect(page.getByRole("button", { name: /hide results/i })).toBeVisible({ timeout: 15000 });

    // With empty/small watch list, should show "add more" message
    await expect(page.getByText(/add more/i)).toBeVisible();
  });
});
