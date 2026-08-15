import { describe, expect, it } from "vitest";
import { availableExerciseCatalog } from "../classes";
import type { TagDefinition } from "./catalog-definition";
import { distinctMovements, filterLibraryItems } from "./library-search";

const tags: TagDefinition[] = [
  { id: "band", label: "Band", category: "equipment" },
  { id: "sliders", label: "Sliders", category: "equipment" },
  { id: "core", label: "Core", category: "body-area" },
  { id: "legs", label: "Legs", category: "body-area" }
];
const items = [
  { id: "one", searchText: "Standing core press", tags: ["band", "core"] },
  { id: "two", searchText: "Side lunge", tags: ["sliders", "legs"] },
  { id: "three", searchText: "Core slider plank", tags: ["sliders", "core"] }
];

describe("filterLibraryItems", () => {
  it("searches names and tag labels case-insensitively", () => {
    expect(filterLibraryItems(items, tags, "SLIDER", new Set()).map((item) => item.id))
      .toEqual(["two", "three"]);
  });

  it("uses OR within a category and AND across categories", () => {
    expect(filterLibraryItems(items, tags, "", new Set(["band", "sliders", "core"])).map(
      (item) => item.id
    )).toEqual(["one", "three"]);
  });

  it("returns an empty list when no item matches", () => {
    expect(filterLibraryItems(items, tags, "yoga", new Set())).toEqual([]);
  });
});

describe("distinctMovements", () => {
  it("collapses a left/right pair authored with guidance on one side only", () => {
    const result = distinctMovements([
      { name: "Clamshell openers", rig: "clamshell-openers", longDescription: "Rotate the upper leg to open." },
      { name: "Clamshell openers", rig: "clamshell-openers" }
    ]);
    expect(result).toHaveLength(1);
    expect(result[0]?.longDescription).toBe("Rotate the upper leg to open.");
  });

  it("keeps the richest guidance when sides describe themselves differently", () => {
    const result = distinctMovements([
      { name: "Curtsy pulse", shortDescription: "Left." },
      { name: "Curtsy pulse", shortDescription: "Right leg diagonally behind; pulse." }
    ]);
    expect(result.map((item) => item.shortDescription)).toEqual([
      "Right leg diagonally behind; pulse."
    ]);
  });

  it("collapses the same movement appearing in two courses", () => {
    const result = distinctMovements([
      { name: "Shavasana", rig: "shavasana", longDescription: "Wipe down the sliders." },
      { name: "Shavasana", rig: "shavasana", longDescription: "See you next time." }
    ]);
    expect(result).toHaveLength(1);
  });

  it("never merges records that resolve to different rigs", () => {
    const result = distinctMovements([
      { name: "Leg lowers", rig: "supine-leg-lowers" },
      { name: "Leg lowers", rig: "banded-leg-lowers" }
    ]);
    expect(result).toHaveLength(2);
  });

  it("leaves distinct movements alone and keeps their order", () => {
    const result = distinctMovements([
      { name: "Cat and cows", rig: "cat-cow" },
      { name: "Thread the needle", rig: "thread-the-needle" },
      { name: "Donkey kick", rig: "donkey-kick" }
    ]);
    expect(result.map((item) => item.name)).toEqual([
      "Cat and cows",
      "Thread the needle",
      "Donkey kick"
    ]);
  });
});

describe("the exercise library", () => {
  it("lists each movement once", () => {
    const names = distinctMovements(availableExerciseCatalog.exercises).map((item) => item.name);
    const repeated = [...new Set(names.filter((name, index) => names.indexOf(name) !== index))];
    expect(repeated, `shown more than once in the library: ${repeated.join(", ")}`).toEqual([]);
  });
});
