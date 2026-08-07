/**
 * The optimistic lock, in one place (FR-013).
 *
 * Every versioned portal model — post, page, agenda, album — needs the same
 * two-step: update only the row whose version still matches, then reload it.
 * Four copies of that is four chances for one to drift into `update()` instead
 * of `updateMany()`, which silently discards the other editor's work rather
 * than refusing.
 *
 * Takes callbacks rather than a Prisma delegate because the delegates are
 * distinct generated types with no shared interface, and a `Record<string,
 * unknown>` shim would give up exactly the typing that makes the callers safe.
 *
 * `null` means "someone else saved first" — the caller turns that into a 409.
 */
export async function updateIfVersionMatches<TRow>(
  update: () => Promise<{ count: number }>,
  reload: () => Promise<TRow>,
): Promise<TRow | null> {
  const { count } = await update();
  if (count === 0) return null;

  return reload();
}
