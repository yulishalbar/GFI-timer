import { expect, test } from "@playwright/test";

test("opens and starts the second weights class", async ({ page }) => {
  await page.goto("./");
  const card = page.getByRole("article").filter({
    has: page.getByRole("heading", { name: "Mat Pilates with Weights #2", exact: true })
  });
  await card.getByRole("button", { name: "View class" }).click();
  await expect(page.getByText("103 timed steps")).toBeVisible();
  await expect(page.getByText("58:00", { exact: true })).toBeVisible();
  await expect(page.locator(".step-row").filter({ hasText: /floor press|suitcase/i })).toHaveCount(0);
  await expect(page.locator(".step-row").filter({ hasText: "Single arm toe reach with weight" })).toHaveCount(2);
  await expect(page.locator(".step-row").filter({ hasText: "Crunch to sit up with weight" })).toHaveCount(1);
  await expect(page.locator(".step-row").filter({ hasText: "Crunch knee in with weight behind knee" })).toHaveCount(2);
  await expect(page.locator(".step-row").filter({ hasText: "B-Stance Squats hold + biceps curls" })).toHaveCount(2);
  await expect(page.locator(".step-row").filter({ hasText: "Front arm raises" })).toHaveCount(2);
  await expect(page.locator(".step-row").filter({ hasText: "Bottom leg lifts" })).toHaveCount(2);
  await expect(page.locator(".step-row").filter({ hasText: "Side-lying open book" })).toHaveCount(2);
  await expect(page.locator(".step-row").filter({ hasText: "Shavasana" })).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Circuit #3: Abs", exact: true })).toBeVisible();
  await expect(page.locator(".step-row--exercise").filter({ hasText: "Leg lowers" })).toHaveCount(5);
  await expect(page.locator(".step-row--exercise").filter({ hasText: "Seated ab rows with weight" })).toHaveCount(2);
  await expect(page.locator(".step-row--exercise").filter({ hasText: "Overhead side body stretch" })).toHaveCount(2);
  await expect(page.locator(".step-row--exercise").filter({ hasText: "Figure four stretch" })).toHaveCount(2);
  await expect(page.locator(".step-row--exercise").filter({ hasText: "Reclining tree pose" })).toHaveCount(2);
  await expect(page.locator(".step-row--exercise").filter({ hasText: "Reclined butterfly" })).toHaveCount(1);
  await expect(page.locator(".step-row--exercise").filter({ hasText: "Seated ab row with both arms" })).toHaveCount(1);
  const glutes = page.locator(".phase-section").filter({ has: page.getByRole("heading", { name: "Circuit #4: Bent-Knee Glutes", exact: true }) });
  const gluteExercises = glutes.locator(".step-row--exercise");
  await expect(gluteExercises).toHaveCount(12);
  for (const row of await gluteExercises.all()) {
    await expect(row).toContainText(/weight behind the bent (left|right) knee/i);
    await expect(row).toContainText("Use no weight if it cannot be held securely");
  }
  await expect(page.locator(".step-row").filter({ hasText: "Serve the platter (out and to the side)" })).toHaveCount(2);
  await expect(page.locator(".step-row").filter({ hasText: "Triceps extensions" })).toHaveCount(0);
  const sideBody = page.locator(".phase-section").filter({ has: page.getByRole("heading", { name: "Circuit #5: Side Body and Inner Thighs", exact: true }) });
  await expect(sideBody.locator(".step-row--exercise")).toHaveCount(14);
  await expect(sideBody).not.toContainText(/suitcase|march|standing/i);
  await expect(page.getByRole("button", { name: "Start class" })).toBeInViewport();
  await page.getByRole("button", { name: "Start class" }).click();
  await expect(page.getByText("running", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Pause", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByRole("heading", { name: "March in place", exact: true })).toBeVisible();
  await expect(page.getByText("Start easy, with relaxed arm swings and comfortable knee lifts.", { exact: true })).toBeVisible();
});
