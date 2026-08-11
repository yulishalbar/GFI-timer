import { expect, test } from "@playwright/test";

test("opens a compiled class schedule and returns to the picker", async ({ page }) => {
  await page.goto("./");

  await expect(page.getByRole("heading", { name: "Choose today's class" })).toBeVisible();
  const classCard = page.getByRole("article").filter({ hasText: "Mat Pilates — July 24" });
  await expect(classCard).toContainText("53.3 min");
  await expect(classCard).toContainText("8 phases");
  await expect(classCard).toContainText("77 steps");

  await classCard.getByRole("button", { name: "View class" }).click();

  await expect(page.getByRole("heading", { name: "Mat Pilates — July 24" })).toBeVisible();
  await expect(page.getByLabel("53.3 min total")).toContainText("53:20");
  await expect(page.getByText("77 timed steps")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Circuit 4 — Lower Body" })).toBeVisible();

  const coreSection = page
    .locator(".phase-section")
    .filter({ has: page.getByRole("heading", { name: "Circuit 1 — Core" }) });
  const exerciseBox = await coreSection.locator(".step-row--exercise").first().boundingBox();
  const transitionBox = await coreSection.locator(".step-row--rest").first().boundingBox();
  expect(exerciseBox).not.toBeNull();
  expect(transitionBox).not.toBeNull();
  expect(transitionBox?.x ?? 0).toBeGreaterThan(exerciseBox?.x ?? 0);

  await page.getByRole("button", { name: "Start class" }).click();
  await expect(page.getByRole("heading", { name: "Class introduction" })).toBeVisible();
  await expect(page.getByText("running", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();

  await page.getByRole("button", { name: "Pause" }).click();
  await expect(page.getByText("paused", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Resume" })).toBeVisible();

  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("heading", { name: "Child's pose and side-body stretch" })).toBeVisible();
  await page.getByRole("slider", { name: "Seek within current step" }).fill("30000");
  await expect(page.getByRole("slider", { name: "Seek within current step" })).toHaveValue("30000");

  await page.getByRole("button", { name: "Previous" }).click();
  await expect(page.getByRole("heading", { name: "Class introduction" })).toBeVisible();
  await page.getByRole("button", { name: "Resume" }).click();
  await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();

  await page.getByRole("button", { name: "Exit session and return to class overview" }).click();
  await expect(page.getByRole("button", { name: "Start class" })).toBeVisible();

  await page.getByRole("button", { name: "All classes" }).click();
  await expect(page.getByRole("heading", { name: "Choose today's class" })).toBeVisible();
});
