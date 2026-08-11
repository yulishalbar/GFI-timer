import { compileClass } from "../domain/compile-class";
import type { CompiledClass } from "../domain/timeline";
import { coreBasics } from "./core-basics";

const classDefinitions: readonly unknown[] = [coreBasics];

export const availableClasses: readonly CompiledClass[] = classDefinitions.map(compileClass);
