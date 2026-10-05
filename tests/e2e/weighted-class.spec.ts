import { expect, test } from "@playwright/test";

test("opens and starts the July 31 weighted adaptation", async ({ page }) => {
  await page.goto("./");
  const card = page.getByRole("article").filter({
    has: page.getByRole("heading", { name: "Mat Pilates with weight", exact: true })
  });
  await expect(card).toContainText("57 min");
  await card.getByRole("button", { name: "View class" }).click();
  await expect(page.getByRole("heading", { name: "Mat Pilates with weight", exact: true })).toBeVisible();
  await expect(page.getByText("92 timed steps")).toBeVisible();
  await expect(page.getByRole("button", { name: "Start class" })).toBeInViewport();
  const squat = page.locator(".step-row").filter({ hasText: "Squat -> add arms" }).first();
  await expect(squat).toContainText("Hold one light weight in each hand");
  await expect(page.locator(".step-row").filter({ hasText: "Extended hamstring curl" })).toHaveCount(2);
  await expect(page.locator(".step-row").filter({ hasText: "Drop the weight:" })).toHaveCount(2);
  await expect(page.locator(".step-row").filter({ hasText: "Single leg toe reach" })).toHaveCount(2);
  await expect(page.locator(".step-row").filter({ hasText: "Sit up twist" })).toHaveCount(2);
  await expect(page.locator(".step-row").filter({ hasText: "Hold one light weight in both hands" })).toHaveCount(1);
  await expect(page.locator(".step-row").filter({ hasText: "kneeling position on both knees" })).toHaveCount(1);
  await expect(page.locator(".step-row").filter({ hasText: "Flutter arms behind back" })).toHaveCount(1);
  await page.getByRole("button", { name: "Start class" }).click();
  await expect(page.getByRole("heading", { name: "INTRODUCTION", exact: true })).toBeVisible();
  await expect(page.getByText(/every exercise can also be done without weights/)).toBeVisible();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Knee pulls alternating legs", exact: true })).toBeVisible();
});
