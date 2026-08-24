/**
 * The part of a classroom code that says which section it is.
 *
 * Codes here carry the grade as well as the section — `VII-A`, `VIII-B` — so a
 * promotion cannot find next year's class by matching the code: `VII-A` never
 * equals `VIII-A`. Matching on the section is what keeps a class together, and
 * it is the difference between VII-A and VII-B both landing in VIII-A and each
 * arriving where the school expects it.
 *
 * The rule is deliberately loose about spelling, because a code is free text a
 * school types:
 *
 *   VII-A     → A      the convention in use
 *   VIII - B  → B      spaces around the separator
 *   IX_C      → C      a different separator
 *   7A        → A      no separator at all
 *   VII       → null   a grade with no section
 *
 * Null means "no section to match on", which is a real answer: a year with one
 * class per grade names them after the grade alone, and those match by level.
 */
export function sectionOf(code: string | null | undefined): string | null {
  if (!code) return null;

  const trimmed = code.trim();
  // After the last separator, if there is one. `VIII - B` and `IX_C` are the
  // same shape as `VII-A` to anyone reading them, so they are here too.
  const separated = /[-_\s]([^-_\s]+)\s*$/.exec(trimmed);
  if (separated?.[1]) return separated[1].toUpperCase();

  // No separator: the trailing letters after a number, as in `7A`. Anchored on
  // a digit so `VII` yields nothing rather than yielding `VII`.
  const suffixed = /\d+\s*([A-Za-z]+)\s*$/.exec(trimmed);
  if (suffixed?.[1]) return suffixed[1].toUpperCase();

  return null;
}

/**
 * Whether two classroom codes name the same section of different grades.
 *
 * Two codes with no section are not a match: `VII` and `VIII` would pair, and
 * so would `VII` and `IX`, which says nothing about where a class should go.
 */
export function isSameSection(
  sourceCode: string | null | undefined,
  targetCode: string | null | undefined,
): boolean {
  const source = sectionOf(sourceCode);
  if (source === null) return false;
  return source === sectionOf(targetCode);
}
