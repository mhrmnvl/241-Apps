import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { glob } from 'node:fs/promises';

/**
 * `User` carries a credential, so no read may take the whole row by accident.
 *
 * Prisma's `include` means "these relations *as well as* every scalar column I
 * own". So `user: { include: { profile: PROFILE_NAME_SELECT } }` reads like a
 * narrowed query and is not one: the profile is narrowed, and the `User` row
 * still arrives complete — `passwordHash`, `lastLoginAt`, timestamps, the lot.
 *
 * That is how `GET /profiles/me` came to answer a student with their homeroom
 * teacher's bcrypt hash. The homeroom branch of the profile read reached a
 * `User` through `include`, and `GetProfileUseCase` returns `{ ...user, profile }`
 * — it spreads whatever it is handed. Neither half was wrong on its own.
 *
 * A `select` has no such default: it returns exactly what is listed. So the
 * rule this sweep enforces is a syntactic one, which is the point — it is
 * checkable without a database, and it fails on the shape rather than on the
 * consequence.
 *
 * The shared shapes are in `prisma-selects.ts`: `USER_REF_SELECT`,
 * `USER_DISPLAY_SELECT`, `USER_ROSTER_SELECT`.
 */

const SRC = join(process.cwd(), 'src');

/** `user: {` … `include:` before the matching `select:`, across line breaks. */
const USER_INCLUDE = /\buser:\s*\{\s*include\s*:/g;

/** `user: true` — the same problem, stated more briefly. */
const USER_TRUE = /\buser:\s*true\b/g;

interface Source {
  path: string;
  text: string;
}

/**
 * Comments are stripped before scanning, so that a file may name the shape it
 * is warning against — which every file involved in the fix does.
 */
function code(text: string): string {
  return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}

async function sourceFiles(): Promise<string[]> {
  const files: string[] = [];
  for await (const entry of glob('**/*.ts', { cwd: SRC })) {
    if (!entry.endsWith('.spec.ts')) files.push(entry);
  }
  return files;
}

function offenders(sources: Source[], pattern: RegExp): string[] {
  return sources
    .filter((source) => new RegExp(pattern.source, 'g').test(source.text))
    .map((source) => source.path);
}

describe('no read takes every column of a User', () => {
  let sources: Source[];

  beforeAll(async () => {
    const files = await sourceFiles();
    sources = await Promise.all(
      files.map(async (path) => ({
        path,
        text: code(await readFile(join(SRC, path), 'utf8')),
      })),
    );
  });

  it('finds the backend sources to check', () => {
    expect(sources.length).toBeGreaterThan(500);
  });

  it('never reaches a user relation with `include`', () => {
    expect(offenders(sources, USER_INCLUDE)).toEqual([]);
  });

  it('never reaches a user relation with `true`', () => {
    expect(offenders(sources, USER_TRUE)).toEqual([]);
  });

  /**
   * Guards the guard: a regex that matches nothing proves nothing, so assert it
   * still fires on the exact shape that caused the leak.
   */
  it('recognises the shape it is looking for', () => {
    const leaky = `{ user: { include: { profile: PROFILE_NAME_SELECT } } }`;
    const safe = `{ user: { select: { id: true, profile: PROFILE_NAME_SELECT } } }`;

    expect(new RegExp(USER_INCLUDE.source).test(leaky)).toBe(true);
    expect(new RegExp(USER_INCLUDE.source).test(safe)).toBe(false);
    expect(new RegExp(USER_TRUE.source).test(`{ user: true }`)).toBe(true);
  });
});
