import { compileClass } from "../domain/compile-class";
import type { CompiledClass } from "../domain/timeline";
import { matPilates0724, matPilates0724Catalog } from "./mat-pilates-07-24";
import { matPilates0731, matPilates0731Catalog } from "./mat-pilates-07-31";
import { hiitPilatesSliders, hiitPilatesSlidersCatalog } from "./hiit-pilates-sliders";
import { matPilatesBand, matPilatesBandCatalog } from "./mat-pilates-band";
import { matPilatesRing, matPilatesRingCatalog } from "./mat-pilates-ring";
import { matPilatesWeightsBlock, matPilatesWeightsBlockCatalog } from "./mat-pilates-weights-block";
import { matPilatesBall } from "./mat-pilates-ball";
import { mergeExerciseCatalogs } from "../catalog/merge-catalogs";

/**
 * Every course here is catalog-backed. The V1 definitions are not listed: they
 * are the hand-authored originals their replacements were built from, and each
 * now compiles to the same timeline. They stay in the repository because the
 * catalog is derived from them and the equivalence tests compare against them,
 * but showing both would just be the same class twice.
 */
const classDefinitions: readonly unknown[] = [
  matPilatesBall,
  matPilatesWeightsBlock,
  matPilatesBand,
  matPilatesRing,
  hiitPilatesSliders,
  matPilates0731,
  matPilates0724
];

export const availableClasses: readonly CompiledClass[] = classDefinitions.map(compileClass);

export const availableExerciseCatalog = mergeExerciseCatalogs(
  matPilatesWeightsBlockCatalog.catalog,
  hiitPilatesSlidersCatalog.catalog,
  matPilatesBandCatalog.catalog,
  matPilatesRingCatalog.catalog,
  matPilates0731Catalog.catalog,
  matPilates0724Catalog.catalog
);

export const courseTagsById: Readonly<Record<string, readonly string[]>> = {
  "mat-pilates-ball": ["mat-pilates", "mat", "ball", "full-body"],
  "mat-pilates-weights-block": ["mat-pilates", "mat", "block", "weights", "full-body"],
  "mat-pilates-band": ["mat-pilates", "mat", "band", "full-body"],
  "mat-pilates-ring": ["mat-pilates", "mat", "ring", "full-body"],
  "hiit-pilates-sliders": ["mat-pilates", "mat", "sliders", "full-body"],
  "mat-pilates-07-31": ["mat-pilates", "mat", "full-body"],
  "mat-pilates-07-24": ["mat-pilates", "mat", "full-body"]
};
