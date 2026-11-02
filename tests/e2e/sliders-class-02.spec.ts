import { expect, test } from "@playwright/test";

test("opens sliders class 2 with revised core guidance and starts it", async ({ page }) => {
  await page.goto("./");
  const card = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "sliders class #2", exact: true }) });
  await card.getByRole("button", { name: "View class" }).click();
  await expect(page.getByRole("heading", { name: "sliders class #2", exact: true })).toBeVisible();
  const core = page.locator(".phase-section").filter({ has: page.getByRole("heading", { name: "Circuit #1: Abs", exact: true }) });
  await expect(core.locator(".step-row--exercise")).toHaveCount(12);
  await expect(core).toContainText("Opposite arm slides + leg crunch");
  await expect(core).toContainText("Single-arm toe reach");
  await page.getByRole("button", { name: "Start class", exact: true }).click();
  await expect(page.getByRole("button", { name: "Pause", exact: true })).toBeVisible();
});
