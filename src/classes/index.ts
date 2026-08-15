import { compileClass } from "../domain/compile-class";
import type { CompiledClass } from "../domain/timeline";
import { matPilates0724 } from "./mat-pilates-07-24";
import { matPilates0731 } from "./mat-pilates-07-31";
import { hiitPilatesSliders, hiitPilatesSlidersCatalog } from "./hiit-pilates-sliders";
import { matPilatesBand, matPilatesBandCatalog } from "./mat-pilates-band";
import { mergeExerciseCatalogs } from "../catalog/merge-catalogs";

/**
 * The V1 sliders and band courses are not listed: they are the hand-authored
 * originals that their catalog-backed replacements were built from, and both
 * now compile to the same timeline. They stay in the repository because the
 * catalog is derived from them and the equivalence tests compare against them,
 * but showing both would just be the same class twice.
 */
const classDefinitions: readonly unknown[] = [
  matPilatesBand,
  hiitPilatesSliders,
  matPilates0731,
  matPilates0724
];

export const availableClasses: readonly CompiledClass[] = classDefinitions.map(compileClass);

export const availableExerciseCatalog = mergeExerciseCatalogs(
  hiitPilatesSlidersCatalog.catalog,
  matPilatesBandCatalog.catalog
);

export const courseTagsById: Readonly<Record<string, readonly string[]>> = {
  "mat-pilates-band": ["mat-pilates", "mat", "band", "full-body"],
  "hiit-pilates-sliders": ["hiit-pilates", "mat", "sliders", "full-body"],
  "mat-pilates-07-31": ["mat-pilates", "mat", "full-body"],
  "mat-pilates-07-24": ["mat-pilates", "mat", "full-body"]
};
