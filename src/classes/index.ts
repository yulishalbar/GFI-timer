import { compileClass } from "../domain/compile-class";
import type { CompiledClass } from "../domain/timeline";
import { matPilates0724 } from "./mat-pilates-07-24";
import { matPilates0731 } from "./mat-pilates-07-31";
import {
  hiitPilatesSliders,
  hiitPilatesSlidersCatalog,
  hiitPilatesSlidersV1
} from "./hiit-pilates-sliders";
import { matPilatesBand, matPilatesBandCatalog, matPilatesBandV1 } from "./mat-pilates-band";
import { mergeExerciseCatalogs } from "../catalog/merge-catalogs";

const classDefinitions: readonly unknown[] = [
  matPilatesBand,
  hiitPilatesSliders,
  matPilatesBandV1,
  hiitPilatesSlidersV1,
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
  "mat-pilates-band-v1": ["mat-pilates", "mat", "band", "full-body"],
  "hiit-pilates-sliders": ["hiit-pilates", "mat", "sliders", "full-body"],
  "hiit-pilates-sliders-v1": ["hiit-pilates", "mat", "sliders", "full-body"],
  "mat-pilates-07-31": ["mat-pilates", "mat", "full-body"],
  "mat-pilates-07-24": ["mat-pilates", "mat", "full-body"]
};
