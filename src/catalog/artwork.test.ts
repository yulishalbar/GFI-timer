import { describe, expect, it } from "vitest";
import { hiitPilatesSlidersCatalog } from "../classes/hiit-pilates-sliders";

const newMotionExercises = [
  "Straight leg sweep",
  "Straight leg sweep circles",
  "Thread the leg and open to the side",
  "Sliders mountain climbers"
] as const;

describe("exercise artwork", () => {
  it.each(newMotionExercises)("gives %s a distinct, offline two-frame motion guide", (name) => {
    const exercise = hiitPilatesSlidersCatalog.catalog.exercises.find((item) => item.name === name);

    expect(exercise?.illustration).toBeUndefined();
    expect(exercise?.motionIllustrations?.length).toBeGreaterThanOrEqual(2);
    exercise?.motionIllustrations?.forEach((path) => {
      expect(path).toMatch(/^exercises\/[a-z0-9-]+\.jpg$/);
    });
  });

  it("does not reuse a frame between the new slider guides", () => {
    const frames = hiitPilatesSlidersCatalog.catalog.exercises
      .filter((exercise) => newMotionExercises.includes(exercise.name as typeof newMotionExercises[number]))
      .flatMap((exercise) => exercise.motionIllustrations ?? []);

    expect(new Set(frames).size).toBe(11);
  });

  it("uses an intermediate inward position to make the slider circle readable", () => {
    const exercise = hiitPilatesSlidersCatalog.catalog.exercises.find(
      (item) => item.name === "Straight leg sweep circles"
    );

    expect(exercise?.motionIllustrations).toEqual([
      "exercises/straight-leg-sweep-circles-motion-1.jpg",
      "exercises/straight-leg-sweep-circles-motion-3.jpg",
      "exercises/straight-leg-sweep-circles-motion-2.jpg"
    ]);
  });

  it("shows the neutral and alternating legs in four mountain-climber stages", () => {
    const exercise = hiitPilatesSlidersCatalog.catalog.exercises.find(
      (item) => item.name === "Sliders mountain climbers"
    );

    expect(exercise?.motionIllustrations).toEqual([
      "exercises/slider-mountain-climbers-v2-motion-1.jpg",
      "exercises/slider-mountain-climbers-v2-motion-2.jpg",
      "exercises/slider-mountain-climbers-v2-motion-3.jpg",
      "exercises/slider-mountain-climbers-v2-motion-4.jpg"
    ]);
  });
});
