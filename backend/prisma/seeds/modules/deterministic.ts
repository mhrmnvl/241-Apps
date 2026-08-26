/**
 * The same school every time.
 *
 * `Math.random()` would give different marks on every run, so a screenshot
 * taken today would not match the database tomorrow — and a mark that moved on
 * its own is exactly the kind of thing a demo cannot explain. Every figure in
 * the seeded data comes from one of these, keyed by something stable about the
 * row it belongs to.
 */
export function seeded(n: number): number {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/** A stable number from a uuid, so a row's own id can drive its figures. */
export function seedOf(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % 1_000_003;
  }
  return hash;
}

/** School days, most recent first, skipping Sundays and any date given. */
export function schoolDays(count: number, skip = new Set<string>()): Date[] {
  const days: Date[] = [];
  const cursor = new Date();
  cursor.setUTCHours(0, 0, 0, 0);

  let guard = 0;
  while (days.length < count && guard++ < count * 4) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    if (cursor.getUTCDay() === 0) continue;
    if (skip.has(cursor.toISOString().slice(0, 10))) continue;
    days.push(new Date(cursor));
  }
  return days.reverse();
}
