import { describe, expect, it } from "vitest";
import type { CourseDefinition, ExerciseCatalog } from "./catalog-definition";
import { compileClass } from "./compile-class";
import { CourseResolutionError, resolveCourseDefinition } from "./resolve-course";

const catalog: ExerciseCatalog = {
  schemaVersion: 1,
  tags: [
    { id: "core", label: "Core", category: "body-area" },
    { id: "mat-pilates", label: "Mat Pilates", category: "modality" },
    { id: "band", label: "Band", category: "equipment" }
  ],
  exercises: [
    {
      schemaVersion: 1,
      id: "side-leg-lift",
      version: 1,
      name: "Side leg lift",
      longDescription: "Keep the hips stacked and lift with control.",
      illustration: "exercises/side-lying-leg-series.svg",
      sideSupport: "left-right",
      tags: ["core", "mat-pilates"]
    },
    {
      schemaVersion: 1,
      id: "roll-up",
      version: 2,
      name: "Roll up",
      sideSupport: "none",
      tags: ["core", "mat-pilates"]
    }
  ]
};

const course: CourseDefinition = {
  schemaVersion: 2,
  id: "catalog-fixture",
  version: 1,
  title: "Catalog fixture",
  tags: ["mat-pilates", "band"],
  phases: [
    {
      id: "main",
      name: "Main",
      items: [
        {
          type: "circuit",
          id: "side-series",
          name: "Side series",
          rounds: 2,
          items: [
            {
              type: "exercise",
              id: "leg-lift-left",
              exerciseId: "side-leg-lift",
              exerciseVersion: 1,
              side: "left",
              durationSeconds: 30
            },
            { type: "rest", id: "switch", name: "REST", durationSeconds: 10 },
            {
              type: "exercise",
              id: "leg-lift-right",
              exerciseId: "side-leg-lift",
              exerciseVersion: 1,
              side: "right",
              durationSeconds: 30
            }
          ]
        },
        {
          type: "exercise",
          id: "roll-up-finish",
          exerciseId: "roll-up",
          exerciseVersion: 2,
          durationSeconds: 40,
          shortDescription: "Course-specific setup cue."
        }
      ]
    }
  ]
};

describe("resolveCourseDefinition", () => {
  it("resolves pinned exercises, sides, tags, circuits, and rests for the existing compiler", () => {
    const resolved = resolveCourseDefinition(catalog, course);
    const compiled = compileClass(resolved);

    expect(compiled.steps).toHaveLength(7);
    expect(compiled.totalDurationMs).toBe(180_000);
    expect(compiled.steps.map((step) => step.name)).toEqual([
      "Side leg lift", "REST", "Side leg lift",
      "Side leg lift", "REST", "Side leg lift",
      "Roll up"
    ]);
    expect(compiled.steps[0]?.exerciseReference).toEqual({
      exerciseId: "side-leg-lift",
      exerciseVersion: 1,
      side: "left",
      tags: ["core", "mat-pilates"]
    });
    expect(compiled.steps.at(-1)).toMatchObject({
      shortDescription: "Course-specific setup cue.",
      exerciseReference: { exerciseId: "roll-up", exerciseVersion: 2 }
    });
    expect(compiled.steps[0]?.round).toEqual({ repeatId: "side-series", index: 1, count: 2 });
  });

  it("rejects missing sides, sides on neutral exercises, unknown references, and stale versions", () => {
    const invalid: CourseDefinition = structuredClone(course);
    const items = invalid.phases[0]!.items;
    const firstItem = items[0];
    if (firstItem?.type !== "circuit") throw new Error("fixture must start with a circuit");
    const firstCircuitItem = firstItem.items[0];
    if (firstCircuitItem?.type !== "exercise") throw new Error("fixture must start with an exercise");
    delete firstCircuitItem.side;
    items.push({
      type: "exercise",
      id: "wrong-side",
      exerciseId: "roll-up",
      exerciseVersion: 1,
      side: "right",
      durationSeconds: 30
    });
    items.push({
      type: "exercise",
      id: "missing",
      exerciseId: "not-in-catalog",
      exerciseVersion: 1,
      durationSeconds: 30
    });

    expect(() => resolveCourseDefinition(catalog, invalid)).toThrow(CourseResolutionError);
    try {
      resolveCourseDefinition(catalog, invalid);
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(CourseResolutionError);
      if (error instanceof CourseResolutionError) {
        expect(error.issues).toContain("course.phases[0].items[0].items[0].side: required for a left-right exercise");
        expect(error.issues).toContain("course.phases[0].items[2].exerciseVersion: expected pinned version 2");
        expect(error.issues).toContain("course.phases[0].items[2].side: not allowed for this exercise");
        expect(error.issues).toContain('course.phases[0].items[3].exerciseId: unknown exercise "not-in-catalog"');
      }
    }
  });

  it("rejects unknown and duplicate tags plus unknown properties", () => {
    const invalidCatalog = structuredClone(catalog);
    invalidCatalog.exercises[0]!.tags = ["core", "core", "unknown-tag"];
    const invalidCourse = { ...course, surprise: true };

    expect(() => resolveCourseDefinition(invalidCatalog, invalidCourse)).toThrow(/duplicate tag "core"/);
    expect(() => resolveCourseDefinition(invalidCatalog, invalidCourse)).toThrow(/unknown tag "unknown-tag"/);
    expect(() => resolveCourseDefinition(invalidCatalog, invalidCourse)).toThrow(/course.surprise: unknown property/);
  });
});
