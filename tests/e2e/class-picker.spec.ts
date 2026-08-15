import { expect, type Locator, test } from "@playwright/test";

/**
 * A pose rig is solved every frame rather than swapped between files, so the
 * meaningful assertion is that its geometry actually changes: this survives
 * re-authoring the pose data, which asserting on filenames did not.
 */
function rigGeometry(rig: Locator): Promise<string> {
  return rig.evaluate((element) =>
    Array.from(element.querySelectorAll("path"))
      .map((path) => path.getAttribute("d"))
      .join("|")
  );
}

async function expectRigAnimates(rig: Locator): Promise<void> {
  await expect(rig).toBeVisible();
  // Guides only run while on screen, so bring it into view before sampling.
  await rig.scrollIntoViewIfNeeded();
  const first = await rigGeometry(rig);
  await expect.poll(() => rigGeometry(rig), { timeout: 4_000 }).not.toBe(first);
}

function durationToSeconds(value: string | null): number {
  const parts = (value ?? "0:00").split(":").map(Number);
  return parts.reduce((total, part) => total * 60 + part, 0);
}

function secondsToDuration(value: number): string {
  const minutes = Math.floor(value / 60).toString().padStart(2, "0");
  const seconds = Math.floor(value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

test("opens a compiled class schedule and returns to the picker", async ({ page }, testInfo) => {
  await page.goto("./");

  await expect(page.getByRole("heading", { name: "Choose today's class" })).toBeVisible();
  const classCard = page.getByRole("article").filter({ hasText: "Mat Pilates — July 24" });
  await expect(classCard).toContainText("60.5 min");
  await expect(classCard).toContainText("8 phases");
  await expect(classCard).toContainText("92 steps");

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await classCard.getByRole("button", { name: "View class" }).click();

  await expect(page.getByRole("heading", { name: "Mat Pilates — July 24" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(page.getByLabel("60.5 min total")).toContainText("1:00:30");
  await expect(page.getByText("92 timed steps")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Circuit 4 — Lower Body" })).toBeVisible();
  const startButton = page.getByRole("button", { name: "Start class" });
  if (testInfo.project.name === "iphone-15-pro-max-chromium") {
    await expect(startButton).toBeInViewport();
  }

  const coreSection = page
    .locator(".phase-section")
    .filter({ has: page.getByRole("heading", { name: "Circuit 1 — Core" }) });
  const exerciseBox = await coreSection.locator(".step-row--exercise").first().boundingBox();
  const transitionBox = await coreSection.locator(".step-row--rest").first().boundingBox();
  expect(exerciseBox).not.toBeNull();
  expect(transitionBox).not.toBeNull();
  expect(transitionBox?.x ?? 0).toBeGreaterThan(exerciseBox?.x ?? 0);

  await page.getByRole("button", { name: "Expand all pose details" }).click();
  // The class was authored with its own wording for a movement the pool already
  // had; the merge policy gives it the pooled name and the pooled rig.
  const childPosePreview = page
    .locator(".step-row")
    .filter({ hasText: "Child's pose with side stretches" });
  await expect(childPosePreview.locator(".pose-details")).toBeVisible();
  await expect(childPosePreview).toContainText("Bring the big toes together");
  await expect(childPosePreview.locator("img")).toHaveCount(0);
  await expectRigAnimates(childPosePreview.locator("svg.exercise-rig"));

  await startButton.click();
  await expect(page.getByRole("heading", { name: "Class introduction" })).toBeVisible();
  await expect(page.getByText("running", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();

  await page.getByRole("button", { name: "Pause" }).click();
  await expect(page.getByText("paused", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Resume" })).toBeVisible();
  const countdown = page.locator(".session-countdown");
  const pausedCountdown = await countdown.textContent();
  const realElapsed = page
    .locator(".overall-progress__labels span")
    .filter({ hasText: "Real elapsed" })
    .locator("strong");
  const elapsedAtPause = durationToSeconds(await realElapsed.textContent());
  await expect.poll(async () => durationToSeconds(await realElapsed.textContent())).toBeGreaterThan(
    elapsedAtPause
  );
  await expect(countdown).toHaveText(pausedCountdown ?? "");

  await page.getByRole("button", { name: "Add 10 seconds to current step" }).click();
  const extendedCountdown = durationToSeconds(await countdown.textContent());
  expect(extendedCountdown).toBe(durationToSeconds(pausedCountdown) + 10);
  await expect
    .poll(() =>
      page.evaluate(() => {
        const value = window.localStorage.getItem("gfi-timer:session:v2");
        return value === null ? null : (JSON.parse(value) as { stepDurationMs?: number }).stepDurationMs;
      })
    )
    .toBe(130_000);

  await page.getByRole("button", { name: "Sound on" }).click();
  await expect(page.getByRole("button", { name: "Muted" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Resume Mat Pilates — July 24?" })).toBeVisible();
  await page.getByRole("button", { name: "Resume session" }).click();
  await expect(page.getByText("paused", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Class introduction" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Muted" })).toBeVisible();
  await expect(countdown).toHaveText(secondsToDuration(extendedCountdown));
  await page.getByRole("button", { name: "Remove 10 seconds from current step" }).click();
  await expect(countdown).toHaveText(pausedCountdown ?? "");

  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("heading", { name: "Child's pose with side stretches" })).toBeVisible();
  await expectRigAnimates(page.locator(".exercise-details svg.exercise-rig"));
  const fullDescription = page.locator(".exercise-details__long");
  await expect(fullDescription).toContainText("Bring the big toes together");
  await expect(fullDescription).toBeVisible();
  if (testInfo.project.name === "iphone-15-pro-max-chromium") {
    const descriptionBox = await fullDescription.boundingBox();
    const controlsBox = await page.locator(".session-controls").boundingBox();
    expect(descriptionBox).not.toBeNull();
    expect(controlsBox).not.toBeNull();
    expect((descriptionBox?.y ?? 0) + (descriptionBox?.height ?? 0)).toBeLessThan(
      controlsBox?.y ?? 0
    );
  }
  // A 60s step leads the handover by 10s: the next movement is previewed and
  // the current one steps back rather than disappearing.
  await page.getByRole("slider", { name: "Seek within current step" }).fill("51000");
  await expect(page.locator(".session-shell")).toHaveClass(/session-shell--ending/);
  await expect(page.locator(".current-step-details")).toBeVisible();
  await expect(page.getByRole("region", { name: "Next step" })).toContainText("Cat");
  await expect(page.locator(".next-step__preview svg.exercise-rig")).toBeVisible();
  await page.getByRole("slider", { name: "Seek within current step" }).fill("30000");
  await expect(page.locator(".session-shell")).not.toHaveClass(/session-shell--ending/);
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

test("resets a restored launch scroll position", async ({ page }) => {
  await page.goto("./");
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    document.body.style.minHeight = "200vh";
    window.scrollTo(0, document.body.scrollHeight);
  });
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);

  await page.reload();

  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(page.getByRole("heading", { name: "Choose today's class" })).toBeInViewport();
});

test("searches and filters the offline course and exercise libraries", async ({ page }) => {
  await page.goto("./");

  await page.getByRole("button", { name: "Band", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Mat Pilates with Band", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "HIIT Pilates with Sliders", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Clear search and filters" }).click();

  await page.getByRole("button", { name: /Exercises/ }).click();
  const search = page.getByRole("searchbox", { name: "Search exercises" });
  await search.fill("single-leg lunge");
  const exercise = page.getByRole("article").filter({
    has: page.getByRole("heading", { name: "Single-leg lunge with slider", exact: true })
  });
  await expect(exercise).toBeVisible();
  await expect(exercise).toContainText("← L / R →");
  await search.fill("straight leg sweep");
  const animatedExercise = page.getByRole("article").filter({
    has: page.getByRole("heading", { name: "Straight leg sweep", exact: true })
  });
  const libraryRig = animatedExercise.locator("svg.exercise-rig");
  await expectRigAnimates(libraryRig);
  await expect(animatedExercise).toContainText("Motion guide");
  // The guide sits on the app's own surface, not a foreign backdrop.
  await expect(libraryRig).toHaveCSS("background-color", "rgb(25, 34, 28)");
  await search.fill("straight leg sweep circles");
  const circleExercise = page.getByRole("article").filter({
    has: page.getByRole("heading", { name: "Straight leg sweep circles", exact: true })
  });
  await expectRigAnimates(circleExercise.locator("svg.exercise-rig"));
  await search.fill("not a real movement");
  await expect(page.getByText("No exercises match this search.")).toBeVisible();
});

test("opens and starts the July 31 class with completed pose guidance", async ({ page }) => {
  await page.goto("./");

  const classCard = page.getByRole("article").filter({ hasText: "Mat Pilates — July 31" });
  await expect(classCard).toContainText("58 min");
  await expect(classCard).toContainText("8 phases");
  await expect(classCard).toContainText("103 steps");
  await classCard.getByRole("button", { name: "View class" }).click();

  await expect(page.getByRole("heading", { name: "Mat Pilates — July 31" })).toBeVisible();
  await expect(page.getByLabel("58 min total")).toContainText("58:00");
  await expect(page.getByRole("heading", { name: "Circuit #5: upper body and back" })).toBeVisible();

  await page.getByRole("button", { name: "Expand all pose details" }).click();
  const kneePull = page.locator(".step-row").filter({ hasText: "Knee pulls alternating legs" });
  await expect(kneePull).toContainText("pull one leg towards the chest using hands under knee");
  await expect(kneePull.getByAltText("Illustration for Knee pulls alternating legs")).toBeVisible();
  const shavasana = page.locator(".step-row").filter({ hasText: "Shavasana" });
  await expect(shavasana.getByLabel("Pose guide for Shavasana")).toBeVisible();
  // Side moved off the name and onto the placement badge when the class was
  // converted, so the movement is named once and carries a directional badge.
  const deadlift = page
    .locator(".step-row")
    .filter({ hasText: "Single-leg deadlift (SLDL) to knee tuck" })
    .first();
  await expect(deadlift.getByLabel("Right side")).toBeVisible();
  const motionFrames = deadlift.locator(".exercise-motion img");
  await expect(motionFrames).toHaveCount(2);
  await expect
    .poll(() =>
      motionFrames.evaluateAll((images) =>
        images.every((image) => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0)
      )
    )
    .toBe(true);

  await page.getByRole("button", { name: "Start class" }).click();
  await expect(page.getByRole("heading", { name: "INTRODUCTION" })).toBeVisible();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("heading", { name: "Knee pulls alternating legs" })).toBeVisible();
  await expect(page.locator(".exercise-details img")).toBeVisible();
});

test("opens and starts the catalog-backed sliders course", async ({ page }) => {
  await page.goto("./");

  const classCard = page.getByRole("article").filter({
    has: page.getByRole("heading", { name: "HIIT Pilates with Sliders", exact: true })
  });
  await expect(classCard).toContainText("50.5 min");
  await expect(classCard).toContainText("8 phases");
  await expect(classCard).toContainText("82 steps");
  await classCard.getByRole("button", { name: "View class" }).click();

  await expect(page.getByRole("heading", { name: "HIIT Pilates with Sliders" })).toBeVisible();
  await expect(page.getByLabel("50.5 min total")).toContainText("50:30");
  const leftBadge = page.getByLabel("Left side").first();
  const rightBadge = page.getByLabel("Right side").first();
  await expect(leftBadge).toBeVisible();
  await expect(rightBadge).toBeVisible();
  expect(await leftBadge.evaluate((element) => getComputedStyle(element).backgroundColor))
    .not.toBe(await rightBadge.evaluate((element) => getComputedStyle(element).backgroundColor));
  await page.getByRole("button", { name: "Expand all pose details" }).click();
  const straightLegSweep = page.locator(".step-row").filter({ hasText: "Straight leg sweep" }).first();
  await expect(straightLegSweep.locator("img")).toHaveCount(0);
  await expectRigAnimates(straightLegSweep.locator("svg.exercise-rig"));
  const mountainClimbers = page.locator(".step-row").filter({ hasText: "Sliders mountain climbers" }).first();
  await expectRigAnimates(mountainClimbers.locator("svg.exercise-rig"));
  await page.getByRole("button", { name: "Start class" }).click();
  await expect(page.getByRole("heading", { name: "Child's pose" })).toBeVisible();

  // Child's pose runs 60s and the handover leads by 10s. The next movement is
  // rigged, so it gets a dimmed preview rather than the current step vanishing.
  await page.getByRole("slider", { name: "Seek within current step" }).fill("52000");
  await expect(page.locator(".session-shell")).toHaveClass(/session-shell--ending/);
  const preview = page.locator(".next-step__preview");
  await expect(preview).toBeVisible();
  await expect(preview.locator("svg.exercise-rig")).toBeVisible();
  await expect(page.locator(".current-step-details")).toBeVisible();
  expect(Number(await preview.evaluate((el) => getComputedStyle(el).opacity))).toBeLessThan(1);
  await page.getByRole("slider", { name: "Seek within current step" }).fill("20000");
  await expect(page.locator(".next-step__preview")).toHaveCount(0);

  // The lead is the same ten seconds on a short step: this one runs 30s, and
  // eight seconds out it is already handing over.
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("heading", { name: /cat and cows/ })).toBeVisible();
  await page.getByRole("slider", { name: "Seek within current step" }).fill("22000");
  await expect(page.locator(".session-shell")).toHaveClass(/session-shell--ending/);
  await expect(page.locator(".next-step__preview")).toBeVisible();
});

/**
 * The session screen is operated from a phone during class, so the narrow
 * layout is the one that has to work. A look-ahead that pushes the movement
 * being performed off screen or under the controls is a regression there, however
 * well it reads on a desktop.
 */
test("keeps the current movement readable during the handover on a phone", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "desktop-chromium", "narrow layout only");
  await page.goto("./");

  const classCard = page.getByRole("article").filter({
    has: page.getByRole("heading", { name: "HIIT Pilates with Sliders", exact: true })
  });
  await classCard.getByRole("button", { name: "View class" }).click();
  await page.getByRole("button", { name: "Start class" }).click();
  await page.getByRole("slider", { name: "Seek within current step" }).fill("52000");
  await expect(page.locator(".session-shell")).toHaveClass(/session-shell--ending/);

  const guide = page.locator(".current-step-details svg.exercise-rig");
  await expect(guide).toBeInViewport();
  await expect(page.locator(".current-step-details")).toHaveCSS("opacity", "1");

  // Nothing overlaps the controls, and the screen still does not scroll.
  const overlap = await page.evaluate(() => {
    const details = document.querySelector(".current-step-details")?.getBoundingClientRect();
    const controls = document.querySelector(".session-controls")?.getBoundingClientRect();
    return details && controls ? Math.round(details.bottom - controls.top) : 0;
  });
  expect(overlap).toBeLessThanOrEqual(0);
  expect(
    await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight)
  ).toBeLessThanOrEqual(0);

  // The look-ahead is present but stays a thumbnail beside the name.
  const previewHeight = await page.locator(".next-step__preview").evaluate((el) => el.getBoundingClientRect().height);
  const guideHeight = await guide.evaluate((el) => el.getBoundingClientRect().height);
  expect(previewHeight).toBeLessThan(guideHeight);
});

test("opens and starts the band class", async ({ page }) => {
  await page.goto("./");

  const classCard = page.getByRole("article").filter({
    has: page.getByRole("heading", { name: "Mat Pilates with Band", exact: true })
  });
  await expect(classCard).toContainText("60 min");
  await expect(classCard).toContainText("8 phases");
  await expect(classCard).toContainText("94 steps");
  await classCard.getByRole("button", { name: "View class" }).click();

  await expect(page.getByRole("heading", { name: "Mat Pilates with Band" })).toBeVisible();
  await expect(page.getByLabel("60 min total")).toContainText("1:00:00");
  await expect(page.getByRole("heading", { name: "Circuit #5: Standing Upper Body and Core" })).toBeVisible();
  await page.getByRole("button", { name: "Start class" }).click();
  await expect(page.getByRole("heading", { name: "INTRODUCTION" })).toBeVisible();
});

test("keeps real elapsed time running after scheduled completion until stopped", async ({ page }) => {
  await page.goto("./");
  await page.evaluate(() => {
    const now = Date.now();
    window.localStorage.setItem(
      "gfi-timer:session:v2",
      JSON.stringify({
        version: 2,
        classId: "mat-pilates-07-31",
        classVersion: 3,
        startedAtEpochMs: now - 5_000,
        elapsedMsFloor: 4_000,
        status: "running",
        stepIndex: 102,
        stepDurationMs: 180_000,
        targetEndEpochMs: now - 1_000,
        savedAtEpochMs: now
      })
    );
  });
  await page.reload();

  await expect(page.getByText("its real elapsed timer is still running")).toBeVisible();
  await page.getByRole("button", { name: "Resume session" }).click();
  await expect(page.getByRole("heading", { name: "Excellent work." })).toBeVisible();
  const elapsed = page.locator(".session-complete-elapsed");
  const initialElapsed = durationToSeconds(await elapsed.textContent());
  await expect.poll(async () => durationToSeconds(await elapsed.textContent())).toBeGreaterThan(
    initialElapsed
  );

  await page.getByRole("button", { name: "Stop timer and return to class overview" }).click();
  await expect(page.getByRole("button", { name: "Start class" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem("gfi-timer:session:v2")))
    .toBeNull();
});

/**
 * A short screen used to hide the guide and its cue outright, which removed the
 * one thing the instructor is looking at. Everything else gives up room
 * instead, and the dashboard scrolls when that is not enough.
 */
test("keeps the guide and its cue on a short screen", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "iphone-15-pro-max-chromium", "viewport is set explicitly");
  await page.setViewportSize({ width: 423, height: 680 });
  await page.goto("./");

  await page
    .getByRole("article")
    .filter({ hasText: "Mat Pilates — July 24" })
    .getByRole("button", { name: "View class" })
    .click();
  await page.getByRole("button", { name: "Start class" }).click();
  await page.getByRole("button", { name: "Next" }).click();

  const guide = page.locator(".exercise-details svg.exercise-rig");
  await expect(guide).toBeVisible();
  await expect(page.locator(".exercise-details__long")).toBeVisible();
  await expect(guide).toBeInViewport();

  // Anything that still does not fit is reachable rather than clipped away.
  const overflow = await page.evaluate(() => {
    const dashboard = document.querySelector(".session-dashboard");
    if (!dashboard) return null;
    return {
      hidden: dashboard.scrollHeight - dashboard.clientHeight,
      scrollable: getComputedStyle(dashboard).overflowY
    };
  });
  expect(overflow?.scrollable).toMatch(/auto|scroll/);
  expect(await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight))
    .toBeLessThanOrEqual(0);
});
