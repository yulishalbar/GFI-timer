import type { TagDefinition } from "./catalog-definition";

export interface SearchableLibraryItem {
  searchText: string;
  tags: readonly string[];
}

function normalize(value: string): string {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase().trim();
}

export interface MovementIdentity {
  rig?: string;
  name: string;
  shortDescription?: string;
  longDescription?: string;
}

const guidanceLength = (item: MovementIdentity): number =>
  (item.shortDescription?.length ?? 0) + (item.longDescription?.length ?? 0);

/**
 * The catalog stores a record per course placement, so one movement can appear
 * several times: once per course, and once per side wherever a left/right pair
 * was authored with the guidance on one side only. The library lists movements
 * rather than records, so it collapses them to a single entry each.
 *
 * Identity is the rig where a movement has one, and the name otherwise — two
 * records with different rigs are different movements and never merge. The
 * record kept is the one carrying the most guidance, because the side that was
 * authored second is usually the one left blank.
 */
export function distinctMovements<T extends MovementIdentity>(items: readonly T[]): T[] {
  const byIdentity = new Map<string, T>();
  items.forEach((item) => {
    const key = item.rig ?? item.name;
    const existing = byIdentity.get(key);
    if (!existing || guidanceLength(item) > guidanceLength(existing)) {
      byIdentity.set(key, item);
    }
  });
  return [...byIdentity.values()];
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
