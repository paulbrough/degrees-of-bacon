import { test, expect } from "@playwright/test";

async function markAsSeen(page: import("@playwright/test").Page) {
  // Wait for seen button to finish loading
  await expect(page.getByRole("button", { name: /mark as seen|seen/i })).toBeVisible();

  // If already marked (added by parallel test), skip
  const alreadySeen = await page.getByRole("button", { name: /^seen$/i }).isVisible();
  if (alreadySeen) return;

  const addButton = page.getByRole("button", { name: /mark as seen/i });
  const [response] = await Promise.all([
    page.waitForResponse((r) => r.url().includes("/api/seenit") && r.request().method() === "POST"),
    addButton.click(),
  ]);
  // Accept 201 (created) or 409 (already exists from parallel test)
  expect([201, 409]).toContain(response.status());
  await expect(page.getByRole("button", { name: /^seen$/i })).toBeVisible();
}

async function removeFromSeen(page: import("@playwright/test").Page) {
  const removeButton = page.getByRole("button", { name: /^seen$/i });
  await expect(removeButton).toBeVisible();
  const [response] = await Promise.all([
    page.waitForResponse((r) => r.url().includes("/api/seenit") && r.request().method() === "DELETE"),
    removeButton.click(),
  ]);
  expect(response.status()).toBe(200);
  await expect(page.getByRole("button", { name: /mark as seen/i })).toBeVisible();
}

test.describe("Seen It", () => {
  test("can mark as seen and remove via movie page", async ({ page }) => {
    await page.goto("/movie/550"); // Fight Club
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await markAsSeen(page);
    await removeFromSeen(page);
  });

  test("seen page shows marked movies and supports removal", async ({ page }) => {
    // Add a movie via the UI
    await page.goto("/movie/550");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await markAsSeen(page);

    // Navigate to seen page
    await page.goto("/seenit");

    // Should show the movie
    await expect(page.getByText("Fight Club")).toBeVisible();

    // Remove it via the X button
    await page.getByText("Fight Club").hover();
    await page.locator("[title='Remove from seen']").click();

    // Movie should disappear, empty state should appear
    await expect(page.getByText("Fight Club")).not.toBeVisible();
    await expect(page.getByText(/haven't marked anything as seen/i)).toBeVisible();
  });

  test("seen page shows empty state", async ({ page }) => {
    // Clear any items added by parallel tests
    await page.goto("/seenit");
    await expect(page.getByRole("heading", { name: /seen it/i })).toBeVisible();
    // Wait for content to settle (either items load or empty state shows)
    await page.waitForTimeout(1000);

    // Remove all items if any exist
    let removeBtn = page.getByTitle("Remove from seen").first();
    while (await removeBtn.isVisible().catch(() => false)) {
      await Promise.all([
        page.waitForResponse((r) => r.url().includes("/api/seenit") && r.request().method() === "DELETE"),
        removeBtn.click(),
      ]);
      await page.waitForTimeout(500);
      removeBtn = page.getByTitle("Remove from seen").first();
    }
    await expect(page.getByText(/haven't marked anything as seen/i)).toBeVisible();
  });

  test("filter controls work", async ({ page }) => {
    // Add a movie
    await page.goto("/movie/550");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await markAsSeen(page);

    // Add a TV show
    await page.goto("/tv/1399");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await markAsSeen(page);

    // Go to seen page
    await page.goto("/seenit");

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
    await removeFromSeen(page);
    await page.goto("/tv/1399");
    await removeFromSeen(page);
  });

  test("nav has seen it link", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /seen it/i })).toBeVisible();
  });
});
