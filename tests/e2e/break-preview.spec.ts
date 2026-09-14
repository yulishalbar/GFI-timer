import { expect, test } from "@playwright/test";
for (const [sourceId, stepIndex, duration, count, phase] of [
  ["hiit-setup", 43, 60_000, 5, "Circuit #4: Legs Focused"],
  ["one-hiit-rest-3", 47, 10_000, 5, "Circuit #4: Legs Focused"],
  ["hiit-side-switch", 51, 60_000, 5, "Circuit #4: Legs Focused"],
  ["hiit-finish-break", 59, 60_000, 13, "Circuit #5: Side Body"]
] as const) {
  test(`break ${sourceId} shows only the next exercise at ten seconds and a summary at one minute`, async ({ page }) => {
    await page.addInitScript(({ stepIndex, duration, classVersion }) => {
      const now = Date.now();
      localStorage.setItem("gfi-timer:session:v2", JSON.stringify({
        version: 2, classId: "hiit-pilates-sliders", classVersion,
        startedAtEpochMs: now, elapsedMsFloor: 0, stepIndex,
        stepDurationMs: duration, savedAtEpochMs: now,
        status: "paused", remainingMs: duration
      }));
    }, { stepIndex, duration, classVersion: 10 });
    await page.goto("./");
    await page.getByRole("button", { name: "Resume session" }).click();
    if (duration === 10_000) {
      await expect(page.locator(".session-phase")).toHaveCount(0);
      await expect(page.locator(".next-step__circuit")).toHaveCount(0);
      await expect(page.locator(".next-step__exercise-count")).toHaveCount(0);
      await expect(page.getByRole("region", { name: "Next step" })).toContainText("Side lunge sliding out");
      await expect(page.getByRole("button", { name: "Next", exact: true })).toBeInViewport();
      return;
    }
    await expect(page.locator(".session-phase")).toContainText(phase);
    const countLabel = page.locator(".next-step__exercise-count");
    await expect(countLabel).toHaveText(`${count} exercises per side`);
    await expect(countLabel).toBeInViewport();
    expect(await countLabel.evaluate((element) => parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(28);
    await expect(page.locator(".next-step__circuit li")).toHaveCount(duration === 60_000 ? count : 0);
    await expect(page.getByRole("button", { name: "Next", exact: true })).toBeInViewport();
    const box = await countLabel.boundingBox();
    const controls = await page.getByRole("navigation", { name: "Session controls" }).boundingBox();
    expect(box!.y + box!.height).toBeLessThanOrEqual(controls!.y);
  });
}
