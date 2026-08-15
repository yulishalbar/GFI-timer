import type { ExerciseSide } from "../domain/catalog-definition";

/**
 * The merge policy from docs/EXERCISE_MERGING.md, applied to names.
 *
 * The dated classes were authored independently of the band and slider classes,
 * so the same movement arrives spelled several ways. Side is stripped
 * mechanically - it belongs on the placement, not on the movement's identity -
 * and the remaining differences are resolved by an explicit table rather than
 * by cleverness, because a wrong merge silently rewrites one class's
 * instructions with another's.
 */

/** `(L)` / `(R)`, anywhere in the name, and a trailing `- left` / `- right`. */
const PAREN_SIDE = /\s*\((L|R)\)/g;
const TRAILING_SIDE = /\s*[—–-]\s*(left|right)(?:\s+round)?\s*$/i;

export function sideFromExerciseName(name: string): ExerciseSide | undefined {
  const trailing = TRAILING_SIDE.exec(name);
  if (trailing) return trailing[1]!.toLowerCase() as ExerciseSide;
  PAREN_SIDE.lastIndex = 0;
  const paren = PAREN_SIDE.exec(name);
  if (paren) return paren[1] === "L" ? "left" : "right";
  return undefined;
}

function withoutSide(name: string): string {
  return name.replace(TRAILING_SIDE, "").replace(PAREN_SIDE, "").trim();
}

/**
 * Names that mean a movement already in the pool. The key is the wording a
 * class used; the value is the name the pool keeps.
 *
 * Every entry here is one of the "obviously the same" cases the policy lists:
 * punctuation, separator style, word order, or singular versus plural. Anything
 * that might be a genuine variation is deliberately absent, so it stays its own
 * movement until someone decides otherwise.
 */
const MERGED_INTO: Readonly<Record<string, string>> = {
  // Punctuation and spelling
  "Cat–cow": "Cat and cows",
  "Roll-ups": "Roll ups",
  "Clam shell openers": "Clamshell openers",
  "High-plank hold": "High plank hold",
  "shoulder rolls": "Shoulder rolls",
  "single-leg deadlift (SLDL) to knee tuck": "Single-leg deadlift (SLDL) to knee tuck",

  // Separator style
  "Child's pose and side-body stretch": "Child's pose with side stretches",
  "Hamstring stretch and seated forward fold": "Hamstring stretch → seated forward fold",
  "Figure four and spinal twist": "Lying figure four → twist → switch sides",

  // Word order
  "Hovering tabletop to downward dog": "Downward dog to hovering tabletop",

  // Singular versus plural
  "Glute bridge pulses": "Glute bridge pulse",
  "Leg lifts": "Leg lift",

  // A qualifier the instructor uses interchangeably. "Merge large/big only" -
  // other qualifiers (half, full-range, small) stay their own movement.
  "Large leg circles": "Big leg circles",
  "Leg circle": "One leg circle",

  // Three spellings of the one movement, merged on the instructor's call. The
  // slider class's own wording was renamed at source to this spelling, so only
  // the remaining variant needs a mapping here.
  "Single leg stretch": "Single-leg stretch"
};

/**
 * The name the catalog should store for a movement: side removed, then the
 * merge table applied.
 */
export function canonicalExerciseName(name: string): string {
  const base = withoutSide(name);
  return MERGED_INTO[base] ?? base;
}
