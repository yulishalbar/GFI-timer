import type { TagDefinition } from "../domain/catalog-definition";

export const builtInTags = [
  { id: "core", label: "Core", category: "body-area" },
  { id: "glutes", label: "Glutes", category: "body-area" },
  { id: "legs", label: "Legs", category: "body-area" },
  { id: "upper-body", label: "Upper Body", category: "body-area" },
  { id: "full-body", label: "Full Body", category: "focus" },
  { id: "mat-pilates", label: "Mat Pilates", category: "modality" },
  { id: "hiit-pilates", label: "HIIT Pilates", category: "modality" },
  { id: "mat", label: "Mat", category: "equipment" },
  { id: "band", label: "Band", category: "equipment" },
  { id: "sliders", label: "Sliders", category: "equipment" },
  { id: "standing", label: "Standing", category: "movement-type" },
  { id: "seated", label: "Seated", category: "movement-type" },
  { id: "supine", label: "Supine", category: "movement-type" },
  { id: "prone", label: "Prone", category: "movement-type" },
  { id: "side-lying", label: "Side-lying", category: "movement-type" },
  { id: "quadruped", label: "Quadruped", category: "movement-type" },
  { id: "plank", label: "Plank", category: "movement-type" }
] as const satisfies readonly TagDefinition[];
