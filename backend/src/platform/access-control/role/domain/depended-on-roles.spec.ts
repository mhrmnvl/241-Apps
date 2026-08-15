import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { glob } from 'node:fs/promises';

/**
 * A role the code resolves by name must be one the code cannot delete.
 *
 * `DeleteRoleUseCase` refuses a role only when `isSystem` is true. That is the
 * whole protection — so any role whose code appears as a literal in the source
 * is one deletion away from breaking the operation that looks it up, and the
 * failure lands nowhere near the role screen.
 *
 * It had already happened. The IAM seed created TEACHER and STUDENT with
 * `isSystem: false` while `prisma-teacher.writer.ts` and
 * `prisma-student.writer.ts` resolved exactly those codes, and the only thing
 * stopping a delete was a hardcoded array in two Vue files that hid the button
 * without touching the endpoint.
 *
 * This is syntactic on purpose: no database, and it fails on the mismatch
 * rather than on the consequence. Resolve a new role by code and the suite
 * stays red until the seed protects it.
 */

const SRC = join(process.cwd(), 'src');
const SEED = join(process.cwd(), 'prisma', 'seeds', 'modules', 'iam.seed.ts');

/** `roleCode: 'TEACHER'` — provisioning an account with a role. */
const ROLE_CODE_FIELD = /roleCode:\s*'([A-Z_]+)'/g;

/** `role: { code: 'STUDENT' }` — filtering a relation by role. */
const ROLE_RELATION = /\brole:\s*\{\s*code:\s*'([A-Z_]+)'/g;

/** `prisma.role.findUnique({ where: { code: 'APPLICANT' } })`, across lines. */
const ROLE_QUERY =
  /\brole\.(?:findUnique|findFirst)\([\s\S]{0,120}?code:\s*'([A-Z_]+)'/g;

function code(text: string): string {
  return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}

function matches(text: string, pattern: RegExp): string[] {
  const found = new Set<string>();
  for (const match of text.matchAll(new RegExp(pattern.source, 'g'))) {
    found.add(match[1]);
  }
  return [...found];
}

/** Role codes the seed creates with `isSystem: true`. */
function protectedBySeed(seed: string): string[] {
  const found: string[] = [];
  for (const entry of seed.matchAll(
    /code:\s*'([A-Z_]+)',[\s\S]{0,200}?isSystem:\s*(true|false)/g,
  )) {
    if (entry[2] === 'true') found.push(entry[1]);
  }
  return found;
}

describe('roles the code resolves by name are protected from deletion', () => {
  let source: string;
  let seed: string;

  beforeAll(async () => {
    const parts: string[] = [];
    for await (const entry of glob('**/*.ts', { cwd: SRC })) {
      if (!entry.endsWith('.spec.ts')) {
        parts.push(await readFile(join(SRC, entry), 'utf8'));
      }
    }
    source = code(parts.join('\n'));
    seed = await readFile(SEED, 'utf8');
    // Reads every source file under `src`, which is slow enough under a full
    // parallel run to exceed jest's 5s default — it passed alone and failed in
    // the suite, which is the worst way for a guard to behave: people learn to
    // re-run instead of to look.
  }, 60_000);

  it('finds the sources and the seed', () => {
    expect(source.length).toBeGreaterThan(1000);
    expect(seed).toContain('isSystem');
  });

  it('seeds every role the code resolves by code as a system role', () => {
    const resolved = [
      ...matches(source, ROLE_CODE_FIELD),
      ...matches(source, ROLE_RELATION),
      ...matches(source, ROLE_QUERY),
    ];
    expect(resolved.length).toBeGreaterThan(0);

    const protectedCodes = protectedBySeed(seed);
    const unprotected = [...new Set(resolved)]
      .filter((role) => !protectedCodes.includes(role))
      .sort();

    expect(unprotected).toEqual([]);
  });

  /**
   * Guards the guard. Each regex covers a shape that actually appears in the
   * repository, and a sweep that matched none of them would pass while
   * checking nothing.
   */
  it('recognises all three shapes it looks for', () => {
    expect(matches(`roleCode: 'TEACHER',`, ROLE_CODE_FIELD)).toEqual([
      'TEACHER',
    ]);
    expect(
      matches(`where: { userId, role: { code: 'STUDENT' } }`, ROLE_RELATION),
    ).toEqual(['STUDENT']);
    expect(
      matches(
        `this.prisma.role.findUnique({\n  where: { code: 'APPLICANT' },\n})`,
        ROLE_QUERY,
      ),
    ).toEqual(['APPLICANT']);
  });

  it('reads isSystem per role rather than anywhere in the file', () => {
    const seedish = `
      { code: 'KEPT', name: 'a', isSystem: true },
      { code: 'LOOSE', name: 'b', isSystem: false },
    `;
    expect(protectedBySeed(seedish)).toEqual(['KEPT']);
  });
});
