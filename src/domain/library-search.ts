import type { TagDefinition } from "./catalog-definition";

export interface SearchableLibraryItem {
  searchText: string;
  tags: readonly string[];
}

function normalize(value: string): string {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase().trim();
}

export function filterLibraryItems<T extends SearchableLibraryItem>(
  items: readonly T[],
  tags: readonly TagDefinition[],
  query: string,
  selectedTagIds: ReadonlySet<string>
): T[] {
  const normalizedQuery = normalize(query);
  const tagsById = new Map(tags.map((tag) => [tag.id, tag]));
  const selectedByCategory = new Map<string, Set<string>>();
  selectedTagIds.forEach((tagId) => {
    const category = tagsById.get(tagId)?.category;
    if (!category) return;
    const categoryTags = selectedByCategory.get(category) ?? new Set<string>();
    categoryTags.add(tagId);
    selectedByCategory.set(category, categoryTags);
  });

  return items.filter((item) => {
    const searchable = normalize([
      item.searchText,
      ...item.tags.map((tagId) => tagsById.get(tagId)?.label ?? tagId)
    ].join(" "));
    if (normalizedQuery && !searchable.includes(normalizedQuery)) return false;

    return [...selectedByCategory.values()].every((categoryTags) =>
      [...categoryTags].some((tagId) => item.tags.includes(tagId))
    );
  });
}
