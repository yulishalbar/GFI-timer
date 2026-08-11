import { describe, expect, it } from "vitest";
import { matPilates0724 } from "../classes/mat-pilates-07-24";
import { compileClass } from "./compile-class";
import { ClassValidationError } from "./validate-class";

describe("compileClass", () => {
  it("expands phases and repeated rounds in authored order", () => {
    const compiled = compileClass(matPilates0724);

    expect(compiled.steps).toHaveLength(77);
    expect(compiled.totalDurationMs).toBe(3_200_000);
    expect(compiled.phases).toEqual([
      { id: "introduction", name: "Introduction", index: 1, stepCount: 1, durationMs: 120_000 },
      { id: "warmup", name: "Warm-Up", index: 2, stepCount: 5, durationMs: 300_000 },
      { id: "core-circuit", name: "Circuit 1 — Core", index: 3, stepCount: 11, durationMs: 290_000 },
      { id: "glutes-circuit", name: "Circuit 2 — Glutes", index: 4, stepCount: 9, durationMs: 380_000 },
      { id: "posterior-core-circuit", name: "Circuit 3 — Core, Glutes, and Back", index: 5, stepCount: 14, durationMs: 400_000 },
      { id: "lower-body-circuit", name: "Circuit 4 — Lower Body", index: 6, stepCount: 14, durationMs: 440_000 },
      { id: "side-body-circuit", name: "Circuit 5 — Side Body", index: 7, stepCount: 16, durationMs: 640_000 },
      { id: "cooldown", name: "Cooldown", index: 8, stepCount: 7, durationMs: 630_000 }
    ]);

    expect(compiled.steps[0]?.name).toBe("Class introduction");
    expect(compiled.steps.at(-1)?.name).toBe("Shavasana");
  });

  it("assigns round and within-round step labels", () => {
    const compiled = compileClass({
      schemaVersion: 1,
      id: "repeat-test",
      version: 1,
      title: "Repeat test",
      phases: [{
        id: "main",
        name: "Main",
        items: [{
          type: "repeat",
          id: "rounds",
          rounds: 3,
          items: [
            { type: "exercise", id: "move", name: "Move", durationSeconds: 30 },
            { type: "rest", id: "break", durationSeconds: 10 }
          ]
        }]
      }]
    });

    expect(compiled.steps.map((step) => step.round)).toEqual([
      { repeatId: "rounds", index: 1, count: 3 },
      { repeatId: "rounds", index: 1, count: 3 },
      { repeatId: "rounds", index: 2, count: 3 },
      { repeatId: "rounds", index: 2, count: 3 },
      { repeatId: "rounds", index: 3, count: 3 },
      { repeatId: "rounds", index: 3, count: 3 }
    ]);
    expect(compiled.steps.map((step) => step.step)).toEqual([
      { index: 1, count: 2 },
      { index: 2, count: 2 },
      { index: 1, count: 2 },
      { index: 2, count: 2 },
      { index: 1, count: 2 },
      { index: 2, count: 2 }
    ]);
  });

  it("calculates stable offsets and unique occurrence IDs", () => {
    const compiled = compileClass(matPilates0724);
    const catCow = compiled.steps[2];

    expect(catCow).toMatchObject({
      runtimeId: "mat-pilates-07-24/warmup/cat-cow",
      sourceId: "cat-cow",
      startsAtMs: 180_000,
      endsAtMs: 210_000
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
