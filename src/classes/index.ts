import { compileClass } from "../domain/compile-class";
import type { CompiledClass } from "../domain/timeline";
import { matPilates0724 } from "./mat-pilates-07-24";

const classDefinitions: readonly unknown[] = [matPilates0724];

export const availableClasses: readonly CompiledClass[] = classDefinitions.map(compileClass);
