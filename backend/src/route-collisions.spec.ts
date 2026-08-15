import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { glob } from 'node:fs/promises';

/**
 * Two controllers may not claim the same URL.
 *
 * Nest registers controllers in module order and Express answers with the first
 * match, so when two controllers declare paths that a single request satisfies,
 * one of them silently never runs. Nothing reports it: the route appears in the
 * boot log, the controller's own spec passes because it calls the method
 * directly, and the endpoint answers — with the other controller's handler.
 *
 * It had happened three times before anyone looked. `GET /profiles/me` was
 * declared by all three profile controllers, so a person's own addresses and
 * social media links were unreachable and `PATCH /profiles/me/:id` ran the
 * address use case against a social media id. `/students` and `/teachers` had
 * the same shape: the whole student-address, teacher-address and
 * student-profile controllers were dead, and were deleted rather than repaired
 * because the profile routes already served that data.
 *
 * Read from the source rather than a booted app: several controllers pull in
 * ESM-only dependencies Jest cannot transform, and the decorators are the
 * authority anyway.
 *
 * The rule is deliberately limited to *different* controllers. `GET
 * /profiles/me` shadowing `GET /profiles/:userId` inside one class is ordinary
 * and correct — the literal is declared first, on purpose, and both are visible
 * in one file. Across two files nobody sees the pair at all.
 */

const SRC = join(process.cwd(), 'src');

const CONTROLLER_PREFIX = /@Controller\(\s*'([^']*)'/;
const ROUTE = /@(Get|Post|Patch|Put|Delete|All)\(\s*(?:'([^']*)')?\s*\)/g;

interface Route {
  file: string;
  method: string;
  path: string;
}

/** `/students/:id` → `^/students/[^/]+$`. */
function matcher(path: string): RegExp {
  const source = path
    .split('/')
    .map((segment) =>
      segment.startsWith(':')
        ? '[^/]+'
        : segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    )
    .join('/');
  return new RegExp(`^${source}$`);
}

/** A concrete URL the route would be asked to serve. */
function concrete(path: string): string {
  return path
    .split('/')
    .map((segment) => (segment.startsWith(':') ? 'a-value' : segment))
    .join('/');
}

function normalise(prefix: string, path: string): string {
  return `/${prefix}/${path}`.replace(/\/+/g, '/').replace(/(.)\/$/, '$1');
}

describe('no two controllers claim the same URL', () => {
  let routes: Route[];

  beforeAll(async () => {
    const found: Route[] = [];
    for await (const entry of glob('**/*.controller.ts', { cwd: SRC })) {
      if (entry.endsWith('.spec.ts')) continue;
      const text = (await readFile(join(SRC, entry), 'utf8'))
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/[^\n]*/g, '');

      const prefix = CONTROLLER_PREFIX.exec(text)?.[1];
      if (prefix === undefined) continue;

      const re = new RegExp(ROUTE.source, 'g');
      let m: RegExpExecArray | null;
      while ((m = re.exec(text))) {
        found.push({
          file: entry.replace(/\\/g, '/'),
          method: m[1].toUpperCase(),
          path: normalise(prefix, m[2] ?? ''),
        });
      }
    }
    routes = found;
  }, 60_000);

  it('finds the routes to check', () => {
    // A sweep over an empty list passes everything below it.
    expect(routes.length).toBeGreaterThan(200);
  });

  it('never lets one controller answer for another', () => {
    const collisions: string[] = [];

    for (let i = 0; i < routes.length; i++) {
      for (let j = i + 1; j < routes.length; j++) {
        const a = routes[i];
        const b = routes[j];
        if (a.file === b.file) continue;
        if (a.method !== b.method) continue;
        if (!matcher(a.path).test(concrete(b.path))) continue;
        if (!matcher(b.path).test(concrete(a.path))) continue;

        collisions.push(
          `${a.method} ${a.path} (${a.file}) and ${b.path} (${b.file}) match the same request`,
        );
      }
    }

    expect(collisions.sort()).toEqual([]);
  });

  /**
   * Guards the guard. A parser that found no parameterised routes, or a matcher
   * that never matched, would pass the assertion above while checking nothing.
   */
  it('recognises the shapes it looks for', () => {
    expect(matcher('/students/:id').test('/students/a-value')).toBe(true);
    expect(matcher('/students/me').test('/students/a-value')).toBe(false);
    expect(routes.some((route) => route.path.includes(':'))).toBe(true);
    expect(routes.some((route) => route.method === 'PATCH')).toBe(true);
  });
});
