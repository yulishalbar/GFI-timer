import { describe, expect, it } from "vitest";
import type { TagDefinition } from "./catalog-definition";
import { filterLibraryItems } from "./library-search";

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
