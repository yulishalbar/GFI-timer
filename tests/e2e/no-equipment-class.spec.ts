import { expect, test } from "@playwright/test";

test("opens and starts No Equipment Mat Pilates", async ({ page }) => {
  await page.goto("./");
  const card = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "No Equipment Mat Pilates", exact: true }) });
  await card.getByRole("button", { name: "View class" }).click();
  await expect(page.getByRole("heading", { name: "No Equipment Mat Pilates", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Start class" }).click();
  await expect(page.getByRole("heading", { name: "Class introduction", exact: true })).toBeVisible();
});
