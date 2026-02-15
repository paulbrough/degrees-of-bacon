import { test, expect } from "@playwright/test";

test.describe("Home / Discovery", () => {
  test("shows trending section with cards", async ({ page }) => {
    await page.goto("/");

    // Should show the heading
    await expect(page.getByRole("heading", { name: /degrees of bacon/i })).toBeVisible();

    // Should show Trending section
    await expect(page.getByText("Trending This Week")).toBeVisible();

    // Should have clickable cards in trending section
    const trendingSection = page.locator("section").filter({ hasText: "Trending This Week" });
    const firstCard = trendingSection.locator("a").first();
    await expect(firstCard).toBeVisible();
    await expect(firstCard).toHaveAttribute("href", /\/(movie|tv)\//);
  });

  test("clicking trending card navigates to detail page", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Trending This Week")).toBeVisible();

    const trendingSection = page.locator("section").filter({ hasText: "Trending This Week" });
    const firstCard = trendingSection.locator("a").first();
    await firstCard.click();

    // Should be on a movie or TV detail page
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("shows Popular Movies and Popular TV Shows sections", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("Popular Movies")).toBeVisible();
    await expect(page.getByText("Popular TV Shows")).toBeVisible();
  });

  test("shows Because You Watched section with seen entry", async ({ page }) => {
    // Add a movie to the seen list first
    await page.goto("/movie/550"); // Fight Club
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Wait for button to load
    await expect(page.getByRole("button", { name: /mark as seen|seen/i })).toBeVisible();

    const addButton = page.getByRole("button", { name: /mark as seen/i });
    if (await addButton.isVisible()) {
      await Promise.all([
        page.waitForResponse((r) => r.url().includes("/api/seenit") && r.request().method() === "POST"),
        addButton.click(),
      ]);
    }

    // Go home — should show "Because You Watched" section
    await page.goto("/");
    await expect(page.getByText(/because you watched/i)).toBeVisible();

    // Cleanup
    await page.goto("/movie/550");
    await expect(page.getByRole("button", { name: /^seen$/i })).toBeVisible();
    await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/seenit") && r.request().method() === "DELETE"),
      page.getByRole("button", { name: /^seen$/i }).click(),
    ]);
  });
});
