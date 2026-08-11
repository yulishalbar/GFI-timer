import { expect, test } from "@playwright/test";

test("opens a compiled class schedule and returns to the picker", async ({ page }) => {
  await page.goto("./");

  await expect(page.getByRole("heading", { name: "Choose today's class" })).toBeVisible();
  const classCard = page.getByRole("article").filter({ hasText: "Core Basics" });
  await expect(classCard).toContainText("8.3 min");
  await expect(classCard).toContainText("3 phases");
  await expect(classCard).toContainText("12 steps");

  await classCard.getByRole("button", { name: "View class" }).click();

  await expect(page.getByRole("heading", { name: "Core Basics" })).toBeVisible();
  await expect(page.getByLabel("8.3 min total")).toContainText("08:20");
  await expect(page.getByText("12 timed steps")).toBeVisible();
  await expect(page.getByText("Round 2/3")).toHaveCount(2);
  await expect(page.getByRole("heading", { name: "Core", exact: true })).toBeVisible();

  await page.getByRole("button", { name: "All classes" }).click();
  await expect(page.getByRole("heading", { name: "Choose today's class" })).toBeVisible();
});
