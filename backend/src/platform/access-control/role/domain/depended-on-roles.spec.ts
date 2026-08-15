import { readFile } from 'node:fs/promises';
import { STRUCTURAL_ROLES } from '../constants/structural-roles.constants.js';
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
 * rather than on the consequence. Resolve a new role by code and the suite stays
 * red until `STRUCTURAL_ROLES` names it.
 */

const SRC = join(process.cwd(), 'src');

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

/**
 * The codes the application protects, read from the constant rather than the
 * seed.
 *
 * It read the seed until the source of truth moved. That mattered: production
 * runs no seed, so a check against it was asking a file that never executes
 * there whether a role would be protected on the box where it matters most.
 * `STRUCTURAL_ROLES` ships with the code, is ensured at boot, and is what
 * `DeleteRoleUseCase` consults.
 */
function protectedByCode(): string[] {
  return STRUCTURAL_ROLES.map((role) => role.code);
}

describe('roles the code resolves by name are protected from deletion', () => {
  let source: string;

  beforeAll(async () => {
    const parts: string[] = [];
    for await (const entry of glob('**/*.ts', { cwd: SRC })) {
      if (!entry.endsWith('.spec.ts')) {
        parts.push(await readFile(join(SRC, entry), 'utf8'));
      }
    }
    source = code(parts.join('\n'));
    // Reads every source file under `src`, which is slow enough under a full
    // parallel run to exceed jest's 5s default — it passed alone and failed in
    // the suite, which is the worst way for a guard to behave: people learn to
    // re-run instead of to look.
  }, 60_000);

  it('finds the sources', () => {
    expect(source.length).toBeGreaterThan(1000);
  });

  it('protects every role the code resolves by name', () => {
    const resolved = [
      ...matches(source, ROLE_CODE_FIELD),
      ...matches(source, ROLE_RELATION),
      ...matches(source, ROLE_QUERY),
    ];
    expect(resolved.length).toBeGreaterThan(0);

    const protectedCodes = protectedByCode();
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

  /**
   * The constant is what `DeleteRoleUseCase` and the bootstrap hook consult, so
   * a code listed here is protected everywhere rather than in whichever file
   * happened to be read.
   */
  it('names the roles the application actually protects', () => {
    expect(protectedByCode()).toContain('TEACHER');
    expect(protectedByCode()).toContain('APPLICANT');
    expect(protectedByCode()).not.toContain('SARPRAS');
  });
});
