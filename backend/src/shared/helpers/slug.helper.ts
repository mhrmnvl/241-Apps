const MAX_SLUG_LENGTH = 220;

// U+0300–U+036F is the Combining Diacritical Marks block. NFKD splits "ā" into
// "a" + macron; stripping the macron keeps the letter, which the ASCII pass
// below would otherwise turn into a hyphen.
const COMBINING_MARKS = /[̀-ͯ]/g;
const NON_ALPHANUMERIC = /[^a-z0-9]+/g;
const EDGE_HYPHENS = /^-+|-+$/g;
const TRAILING_HYPHENS = /-+$/g;

/**
 * Turns a title into a URL-safe slug. Uniqueness is not this function's job —
 * only the database knows what is taken, so callers probe and suffix.
 */
export function toSlug(value: string): string {
  return value
    .normalize('NFKD')
    .replace(COMBINING_MARKS, '')
    .toLowerCase()
    .replace(NON_ALPHANUMERIC, '-')
    .replace(EDGE_HYPHENS, '')
    .slice(0, MAX_SLUG_LENGTH)
    .replace(TRAILING_HYPHENS, '');
}

/**
 * Appends the smallest numeric suffix that avoids `taken`. Two posts titled
 * "Peringatan Maulid Nabi" in different years both need a working address.
 */
export function toUniqueSlug(value: string, taken: readonly string[]): string {
  const base = toSlug(value);
  if (base.length === 0) {
    throw new Error('Slug source produced an empty slug');
  }

  const used = new Set(taken);
  if (!used.has(base)) return base;

  for (let suffix = 2; ; suffix++) {
    const room = MAX_SLUG_LENGTH - String(suffix).length - 1;
    const candidate = `${base.slice(0, room).replace(TRAILING_HYPHENS, '')}-${suffix}`;
    if (!used.has(candidate)) return candidate;
  }
}
