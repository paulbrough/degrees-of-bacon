import { test, expect } from "@playwright/test";

async function addToWatchList(page: import("@playwright/test").Page) {
  // Wait for watchlist button to finish loading
  await expect(page.getByRole("button", { name: /add to watch list|on watch list/i })).toBeVisible();

  // If already on watch list (added by parallel test), skip
  const alreadyOnList = await page.getByRole("button", { name: /on watch list/i }).isVisible();
  if (alreadyOnList) return;

  const addButton = page.getByRole("button", { name: /add to watch list/i });
  const [response] = await Promise.all([
    page.waitForResponse((r) => r.url().includes("/api/watchlist") && r.request().method() === "POST"),
    addButton.click(),
  ]);
  // Accept 201 (created) or 409 (already exists from parallel test)
  expect([201, 409]).toContain(response.status());
  await expect(page.getByRole("button", { name: /on watch list/i })).toBeVisible();
}

async function removeFromWatchList(page: import("@playwright/test").Page) {
  const removeButton = page.getByRole("button", { name: /on watch list/i });
  await expect(removeButton).toBeVisible();
  const [response] = await Promise.all([
    page.waitForResponse((r) => r.url().includes("/api/watchlist") && r.request().method() === "DELETE"),
    removeButton.click(),
  ]);
  expect(response.status()).toBe(200);
  await expect(page.getByRole("button", { name: /add to watch list/i })).toBeVisible();
}

test.describe("Watch List", () => {
  test("can add and remove from watch list via movie page", async ({ page }) => {
    await page.goto("/movie/550"); // Fight Club
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await addToWatchList(page);
    await removeFromWatchList(page);
  });

  test("watch list page shows added movies and supports removal", async ({ page }) => {
    // Add a movie via the UI
    await page.goto("/movie/550");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await addToWatchList(page);

    // Navigate to watch list page
    await page.goto("/watchlist");

    // Should show the movie
    await expect(page.getByText("Fight Club")).toBeVisible();

    // Remove it via the X button
    await page.getByText("Fight Club").hover();
    await page.locator("[title='Remove from watch list']").click();

    // Movie should disappear, empty state should appear
    await expect(page.getByText("Fight Club")).not.toBeVisible();
    await expect(page.getByText(/your watch list is empty/i)).toBeVisible();
  });

  test("watch list page shows empty state", async ({ page }) => {
    // Clear any items added by parallel tests
    await page.goto("/watchlist");
    await expect(page.getByRole("heading", { name: /watch list/i })).toBeVisible();
    // Wait for content to settle (either items load or empty state shows)
    await page.waitForTimeout(1000);

    // Remove all items if any exist
    let removeBtn = page.getByTitle("Remove from watch list").first();
    while (await removeBtn.isVisible().catch(() => false)) {
      await Promise.all([
        page.waitForResponse((r) => r.url().includes("/api/watchlist") && r.request().method() === "DELETE"),
        removeBtn.click(),
      ]);
      await page.waitForTimeout(500);
      removeBtn = page.getByTitle("Remove from watch list").first();
    }
    await expect(page.getByText(/your watch list is empty/i)).toBeVisible();
  });

  test("filter controls work", async ({ page }) => {
    // Add a movie
    await page.goto("/movie/550");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await addToWatchList(page);

    // Add a TV show
    await page.goto("/tv/1399");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await addToWatchList(page);

    // Go to watchlist
    await page.goto("/watchlist");

    // Both should be visible initially
    await expect(page.getByText("Fight Club")).toBeVisible();
    await expect(page.getByText("Game of Thrones")).toBeVisible();

    // Click Movies filter
    await page.getByRole("button", { name: "Movies" }).click();
    await expect(page.getByText("Fight Club")).toBeVisible();
    await expect(page.getByText("Game of Thrones")).not.toBeVisible();

    // Click TV Shows filter
    await page.getByRole("button", { name: "TV Shows" }).click();
    await expect(page.getByText("Game of Thrones")).toBeVisible();
    await expect(page.getByText("Fight Club")).not.toBeVisible();

    // Click All filter
    await page.getByRole("button", { name: "All" }).click();
    await expect(page.getByText("Fight Club")).toBeVisible();
    await expect(page.getByText("Game of Thrones")).toBeVisible();

    // Cleanup
    await page.goto("/movie/550");
    await removeFromWatchList(page);
    await page.goto("/tv/1399");
    await removeFromWatchList(page);
  });

  test("nav has watch list link", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /watch list/i })).toBeVisible();
  });
});
