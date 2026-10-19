import { expect, test } from "@playwright/test";

test("starts the new Pilates ball class offline", async ({ page, context }) => {
  await page.goto("./");
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  const card = page.getByRole("article").filter({ hasText: "Pilates Ball Mat Pilates #1" });
  await card.getByRole("button", { name: "View class" }).click();
  const start = page.getByRole("button", { name: "Start class" });
  await expect(start).toBeInViewport();
  await start.click();
  await expect(page.getByRole("heading", { name: "Class introduction", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(page.getByRole("button", { name: "Resume", exact: true })).toBeVisible();
});
