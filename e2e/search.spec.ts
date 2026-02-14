import { test, expect } from "@playwright/test";

test.describe("Search results page", () => {
  test("shows Top Result hero and unified list for a popular query", async ({
    page,
  }) => {
    await page.goto("/search?q=game+of+thrones");

    // Page heading
    await expect(
      page.getByRole("heading", { name: /results for/i })
    ).toBeVisible();

    // Top Result section exists
    await expect(page.getByText("Top Result")).toBeVisible();

    // Top Result card links to a detail page
    const topResultLink = page
      .locator("section")
      .filter({ hasText: "Top Result" })
      .locator("a")
      .first();
    await expect(topResultLink).toHaveAttribute("href", /\/(movie|tv|person)\//);

    // Filter tabs exist with counts
    for (const tab of ["All", "Movies", "TV Shows", "People"]) {
      await expect(page.getByRole("button", { name: new RegExp(tab) })).toBeVisible();
    }

    // All tab is active by default — grid should have items
    const gridItems = page.locator("section").last().locator("a");
    await expect(gridItems.first()).toBeVisible();
  });

  test("filter tabs work correctly", async ({ page }) => {
    await page.goto("/search?q=brad+pitt");

    // Wait for results
    await expect(page.getByText("Top Result")).toBeVisible();

    // Click Movies tab
    await page.getByRole("button", { name: /Movies/ }).click();

    // All visible links in the results grid should go to /movie/
    const resultLinks = page
      .locator("section")
      .last()
      .locator("a[href^='/movie/'], a[href^='/tv/'], a[href^='/person/']");
    const count = await resultLinks.count();
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        await expect(resultLinks.nth(i)).toHaveAttribute("href", /^\/movie\//);
      }
    }

    // Click People tab — for "brad pitt", Brad Pitt himself is the Top Result
    // and excluded from the list, so the People tab may show 0 results.
    // Verify that the tab click works and only person links (if any) are shown.
    const peopleTab = page.getByRole("button", { name: /People/ });
    const peopleText = await peopleTab.textContent();
    const peopleCountMatch = peopleText?.match(/\((\d+)\)/);
    const expectedPeopleCount = peopleCountMatch
      ? parseInt(peopleCountMatch[1], 10)
      : 0;
    await peopleTab.click();
    const personLinks = page.locator("section").last().locator("a[href^='/person/']");
    await expect(personLinks).toHaveCount(expectedPeopleCount);
  });

  test("person as Top Result shows known-for info", async ({ page }) => {
    await page.goto("/search?q=brad+pitt");

    const topSection = page
      .locator("section")
      .filter({ hasText: "Top Result" });

    // Should show Person badge and known-for info
    await expect(topSection.getByText("Person")).toBeVisible();
    await expect(topSection.getByText(/known for/i)).toBeVisible();
  });

  test("no results shows appropriate message", async ({ page }) => {
    await page.goto("/search?q=zzzxyznonexistent12345");

    await expect(page.getByText("No results found")).toBeVisible();
  });

  test("tab counts match filtered results", async ({ page }) => {
    await page.goto("/search?q=game+of+thrones");

    await expect(page.getByText("Top Result")).toBeVisible();

    // Extract count from Movies tab text, e.g. "Movies (5)"
    const moviesTab = page.getByRole("button", { name: /Movies/ });
    const moviesText = await moviesTab.textContent();
    const moviesCountMatch = moviesText?.match(/\((\d+)\)/);
    const expectedMovieCount = moviesCountMatch
      ? parseInt(moviesCountMatch[1], 10)
      : 0;

    // Click Movies tab and count results
    await moviesTab.click();

    if (expectedMovieCount > 0) {
      const movieLinks = page.locator("section").last().locator("a[href^='/movie/']");
      await expect(movieLinks).toHaveCount(expectedMovieCount);
    }
  });
});
