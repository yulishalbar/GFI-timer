import { expect, test } from "@playwright/test";

test("opens and starts the band and weights class", async ({ page }) => {
  await page.goto("./");
  const card = page.getByRole("article").filter({
    has: page.getByRole("heading", { name: "Mat Pilates with Band and Weights", exact: true })
  });
  await expect(card).toContainText("57.8 min");
  await card.getByRole("button", { name: "View class" }).click();
  await expect(page.getByRole("button", { name: "Start class" })).toBeInViewport();
  await expect(page.locator(".step-row").filter({ hasText: "1/2 roll up" })).toContainText("Band above knees");
  await expect(page.locator(".step-row").filter({ has: page.getByText("Teaser to row arms", { exact: true }) })).toHaveCount(0);
  await expect(page.locator(".step-row").filter({ has: page.getByText("Boat hold", { exact: true }) })).toContainText("0:20");
  await expect(page.locator(".step-row").filter({ has: page.getByText("Clamshell to teaser", { exact: true }) })).toHaveCount(2);
  await expect(page.locator(".step-row").filter({ hasText: "Book opens" })).toHaveCount(1);
  await expect(page.locator(".step-row").filter({ has: page.getByText("Serve the platter", { exact: true }) })).toHaveCount(1);
  const sideBody = page.locator(".phase-section").filter({ has: page.getByRole("heading", { name: "Circuit #5: Side Body, Core and Glutes", exact: true }) });
  await expect(sideBody.locator(".step-row--rest")).toHaveCount(1);
  await expect(sideBody.locator(".step-row--exercise")).toHaveCount(11);
  const sideNames = await sideBody.locator(".step-row__title strong").allTextContents();
  const rightCrunchIndex = sideNames.lastIndexOf("Side-body crunches");
  expect(sideNames[rightCrunchIndex + 1]).toBe("Clamshell to teaser");
  const glutes = page.locator(".phase-section").filter({ has: page.getByRole("heading", { name: "Circuit #2: Glutes", exact: true }) });
  await expect(glutes.getByText("Donkey kick + regular crunch", { exact: true })).toHaveCount(2);
  const cooldown = page.locator(".phase-section").filter({ has: page.getByRole("heading", { name: "Cooldown", exact: true }) });
  await expect(cooldown.locator(".step-row--exercise")).toHaveCount(8);
  await expect(cooldown.locator(".step-row--rest")).toHaveCount(1);
  await expect(cooldown.locator(".step-row").filter({ has: page.getByText("Single leg hug knees to chest", { exact: true }) })).toHaveCount(2);
  await expect(cooldown.getByText("Extend legs straight out.", { exact: true })).toBeVisible();
  await expect(page.locator(".phase-section h3, .phase-section h2")).toContainText([
    "Introduction", "Warm-Up", "Circuit #1", "Circuit #2", "Circuit #3", "Circuit #4: Standing Upper Body", "Circuit #5: Side Body", "Cooldown"
  ]);
  await expect(page.locator(".step-row").filter({ hasText: "Wide offering with rotation" })).toHaveCount(0);
  await page.getByRole("button", { name: "Start class" }).click();
  await expect(page.getByRole("heading", { name: "INTRODUCTION", exact: true })).toBeVisible();
  await expect(page.getByText(/Every exercise can also be done with the band alone/)).toBeVisible();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Child's pose with side stretches", exact: true })).toBeVisible();
});
