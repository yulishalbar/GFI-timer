import { describe, expect, it } from "vitest";
import { ClassValidationError, validateClassDefinition } from "./validate-class";

describe("validateClassDefinition", () => {
  it("accepts a minimal valid class", () => {
    const definition = {
      schemaVersion: 1,
      id: "minimal",
      version: 1,
      title: "Minimal class",
      phases: [
        {
          id: "main",
          name: "Main",
          items: [{ type: "exercise", id: "move", name: "Move", durationSeconds: 30 }]
        }
      ]
    };

    expect(validateClassDefinition(definition)).toBe(definition);
  });

  it.each(["pose.svg", "pose.png", "pose.jpg", "pose.jpeg", "pose.webp"])(
    "accepts local %s illustration assets",
    (illustration) => {
      expect(() =>
        validateClassDefinition({
          schemaVersion: 1,
          id: "illustrated",
          version: 1,
          title: "Illustrated class",
          phases: [
            {
              id: "main",
              name: "Main",
              items: [
                {
                  type: "exercise",
                  id: "pose",
                  name: "Pose",
                  durationSeconds: 30,
                  illustration
                }
              ]
            }
          ]
        })
      ).not.toThrow();
    }
  );

  it("reports invalid durations and unsafe illustration paths", () => {
    expect(() =>
      validateClassDefinition({
        schemaVersion: 1,
        id: "unsafe",
        version: 1,
        title: "Unsafe",
        phases: [
          {
            id: "main",
            name: "Main",
            items: [
              {
                type: "exercise",
                id: "move",
                name: "Move",
                durationSeconds: 0,
                illustration: "../private.svg"
              }
            ]
          }
        ]
      })
    ).toThrowError(ClassValidationError);
  });

  it("caps repeat nesting", () => {
    let nested: unknown = {
      type: "exercise",
      id: "move",
      name: "Move",
      durationSeconds: 1
    };

    for (let index = 0; index < 5; index += 1) {
      nested = {
        type: "repeat",
        id: `repeat-${index}`,
        rounds: 1,
        items: [nested]
      };
    }

    expect(() =>
      validateClassDefinition({
        schemaVersion: 1,
        id: "too-deep",
        version: 1,
        title: "Too deep",
        phases: [{ id: "main", name: "Main", items: [nested] }]
      })
    ).toThrow(/repeat nesting cannot exceed 4 levels/);
  });
});
