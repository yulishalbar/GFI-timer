import { describe, expect, it } from "vitest";
import { coreBasics } from "../classes/core-basics";
import { compileClass } from "./compile-class";
import { ClassValidationError } from "./validate-class";

describe("compileClass", () => {
  it("expands phases and repeated rounds in authored order", () => {
    const compiled = compileClass(coreBasics);

    expect(compiled.steps).toHaveLength(12);
    expect(compiled.totalDurationMs).toBe(500_000);
    expect(compiled.phases).toEqual([
      { id: "intro", name: "Intro", index: 1, stepCount: 1, durationMs: 180_000 },
      { id: "warmup", name: "Warmup", index: 2, stepCount: 6, durationMs: 180_000 },
      { id: "core", name: "Core", index: 3, stepCount: 5, durationMs: 140_000 }
    ]);

    expect(compiled.steps.map((step) => step.name)).toEqual([
      "Introduction",
      "Stretch left leg",
      "Stretch right leg",
      "Stretch left leg",
      "Stretch right leg",
      "Stretch left leg",
      "Stretch right leg",
      "Crunches",
      "Break",
      "Crunch left",
      "Crunch right",
      "Break"
    ]);
  });

  it("assigns round and within-round step labels", () => {
    const compiled = compileClass(coreBasics);
    const warmup = compiled.steps.filter((step) => step.phase.id === "warmup");

    expect(warmup.map((step) => step.round)).toEqual([
      { repeatId: "leg-stretches", index: 1, count: 3 },
      { repeatId: "leg-stretches", index: 1, count: 3 },
      { repeatId: "leg-stretches", index: 2, count: 3 },
      { repeatId: "leg-stretches", index: 2, count: 3 },
      { repeatId: "leg-stretches", index: 3, count: 3 },
      { repeatId: "leg-stretches", index: 3, count: 3 }
    ]);
    expect(warmup.map((step) => step.step)).toEqual([
      { index: 1, count: 2 },
      { index: 2, count: 2 },
      { index: 1, count: 2 },
      { index: 2, count: 2 },
      { index: 1, count: 2 },
      { index: 2, count: 2 }
    ]);
  });

  it("calculates stable offsets and unique occurrence IDs", () => {
    const compiled = compileClass(coreBasics);
    const secondRoundFirstStep = compiled.steps[3];

    expect(secondRoundFirstStep).toMatchObject({
      runtimeId: "core-basics/warmup/leg-stretches[2]/stretch-left",
      sourceId: "stretch-left",
      startsAtMs: 240_000,
      endsAtMs: 270_000
    });
    expect(new Set(compiled.steps.map((step) => step.runtimeId)).size).toBe(
      compiled.steps.length
    );
  });

  it("uses a default name for rests", () => {
    const compiled = compileClass({
      schemaVersion: 1,
      id: "rest-test",
      version: 1,
      title: "Rest test",
      phases: [
        {
          id: "main",
          name: "Main",
          items: [{ type: "rest", id: "quiet-break", durationSeconds: 10 }]
        }
      ]
    });

    expect(compiled.steps[0]?.name).toBe("Break");
  });

  it("rejects unknown fields and duplicate IDs with exact paths", () => {
    expect(() =>
      compileClass({
        schemaVersion: 1,
        id: "invalid-class",
        version: 1,
        title: "Invalid",
        phases: [
          {
            id: "main",
            name: "Main",
            items: [
              { type: "exercise", id: "move", name: "Move", durationSeconds: 10 },
              {
                type: "exercise",
                id: "move",
                name: "Move again",
                durationSeconds: 10,
                durationSecond: 12
              }
            ]
          }
        ]
      })
    ).toThrow(ClassValidationError);

    try {
      compileClass({
        schemaVersion: 1,
        id: "invalid-class",
        version: 1,
        title: "Invalid",
        phases: [
          {
            id: "main",
            name: "Main",
            items: [
              { type: "rest", id: "break", durationSeconds: 10 },
              { type: "rest", id: "break", durationSeconds: 10, durationSecond: 12 }
            ]
          }
        ]
      });
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(ClassValidationError);
      if (error instanceof ClassValidationError) {
        expect(error.issues).toContain('class.phases[0].items[1].id: duplicate ID "break" in this group');
        expect(error.issues).toContain("class.phases[0].items[1].durationSecond: unknown property");
      }
    }
  });
});
