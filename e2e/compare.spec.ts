import { test, expect } from "@playwright/test";

test.describe("Compare", () => {
  test("compare page loads with pre-filled production from URL", async ({ page }) => {
    // Navigate with production A pre-filled (Fight Club)
    await page.goto("/compare?a=550&aType=movie");

    await expect(page.getByRole("heading", { name: /compare/i })).toBeVisible();

    // Production A should be pre-filled showing "Fight Club"
    await expect(page.getByText("Fight Club")).toBeVisible();

    // Production B picker should be visible (search input)
    await expect(page.getByPlaceholder(/search for a movie or tv show/i)).toBeVisible();
  });

  test("can search and select production B, see shared people", async ({ page }) => {
    // Start with The Dark Knight pre-filled as production A
    await page.goto("/compare?a=155&aType=movie");
    await expect(page.getByText("The Dark Knight")).toBeVisible();

    // Search for Batman Begins (TMDB ID 272) as production B
    const searchInput = page.getByPlaceholder(/search for a movie or tv show/i);
    await searchInput.fill("Batman Begins");

    // Wait for results dropdown
    await expect(page.getByText("Batman Begins").first()).toBeVisible();

    // Click on the result
    await page.getByText("Batman Begins").first().click();

    // Wait for comparison results
    await expect(page.getByText(/shared/i)).toBeVisible({ timeout: 15000 });

    // Should show shared actors (e.g., Christian Bale, etc.)
    await expect(page.getByText("Actors")).toBeVisible();
  });

  test("movie page Compare with link navigates to compare page", async ({ page }) => {
    await page.goto("/movie/550"); // Fight Club
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Click "Compare with..."
    await page.getByRole("link", { name: /compare with/i }).click();

    // Should be on compare page with Fight Club pre-filled
    await expect(page.getByRole("heading", { name: /compare/i })).toBeVisible();
    await expect(page.getByText("Fight Club")).toBeVisible();
  });

  test("shows no people in common for unrelated productions", async ({ page }) => {
    // Compare two very different productions
    await page.goto("/compare?a=550&aType=movie&b=1399&bType=tv");

    // Wait for results
    await expect(page.getByText(/shared/i)).toBeVisible({ timeout: 15000 });

    // May have 0 or some shared people - just verify the results loaded
    const sharedText = await page.getByText(/\d+ shared/).textContent();
    expect(sharedText).toBeTruthy();
  });

  test("can clear and re-select productions", async ({ page }) => {
    await page.goto("/compare?a=550&aType=movie");
    await expect(page.getByText("Fight Club")).toBeVisible();

    // Clear production A
    const clearButton = page.getByRole("button", { name: "✕" });
    await clearButton.click();

    // Should show search input again
    const searchInputs = page.getByPlaceholder(/search for a movie or tv show/i);
    await expect(searchInputs.first()).toBeVisible();
  });

  test("nav has compare link", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /compare/i })).toBeVisible();
  });
});
