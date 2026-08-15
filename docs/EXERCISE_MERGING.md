# Adding an exercise to the catalog

There is one shared pool of exercises. Classes reference it; they do not carry
their own copies. When a class introduces an exercise, decide whether it is
already in the pool before adding anything.

## The rule

**Exact name match — reuse it.** Reference the pooled exercise. Do not add a
second record.

**Different wording, obviously the same movement — merge.** Reuse the pooled
exercise and keep the clearer of the two names. These count as obviously the
same:

| Difference | Example |
| --- | --- |
| Punctuation or spacing | `Roll-ups` / `Roll ups`, `Clam shell openers` / `Clamshell openers` |
| A side suffix | `Leg lift (L)` / `Leg lift`, `Thread the needle — right` / `Thread the needle` |
| Word order only | `Hovering tabletop to downward dog` / `Downward dog to hovering tabletop` |
| A separator style | `Hamstring stretch and seated forward fold` / `Hamstring stretch → seated forward fold` |
| Singular versus plural | `Glute bridge pulses` / `Glute bridge pulse` |

Side is not part of an exercise's identity. It belongs on the placement, where
`sideSupport` and the directional badge carry it, so `(L)` and `(R)` always
collapse to one entry.

**In doubt — ask.** If the wording difference might mean a genuine variation, a
different range of motion, or a different position, stop and ask rather than
guessing. Two specific traps:

- **A qualifier may or may not be a new movement.** `Full-range glute bridge`
  versus `Glute bridge`, `Half rainbow` versus `Rainbow`. Sometimes it is the
  same movement described more precisely; sometimes it is a deliberately
  different range that deserves its own entry and its own rig.
- **A bundled extra element is a variation.** `Alternating bird dog → add wrist
  circles` is not plainly the same as `Alternating bird dogs`.

Merging wrongly is worse than leaving a duplicate: it silently rewrites one
class's instructions with another's, and the two share a rig from then on.

## What a merge actually costs

Merged exercises share:

- the description shown in the class and the library,
- the pose rig, and therefore the visual,
- the tags used for search and filtering.

So merge only when all three should genuinely be shared.

## Where the mapping lives

- `src/rig/assignments.ts` maps an exercise name to its rig. Two names that mean
  the same movement may point at the same rig even before their records are
  merged — that is how the same movement stays drawn one way everywhere.
- `distinctMovements` in `src/domain/library-search.ts` collapses records for the
  library view, keyed on the rig where one exists. It hides duplicates from the
  reader; it does not merge them in the catalog.

A test pins the library at zero repeated names, so a duplicate that slips into
the catalog shows up as a failure rather than as a second card.
