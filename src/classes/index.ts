import { compileClass } from "../domain/compile-class";
import type { CompiledClass } from "../domain/timeline";
import { matPilates0724 } from "./mat-pilates-07-24";
import { matPilates0731 } from "./mat-pilates-07-31";
import { hiitPilatesSliders } from "./hiit-pilates-sliders";
import { matPilatesBand } from "./mat-pilates-band";

const classDefinitions: readonly unknown[] = [matPilatesBand, hiitPilatesSliders, matPilates0731, matPilates0724];

export const availableClasses: readonly CompiledClass[] = classDefinitions.map(compileClass);
