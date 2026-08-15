import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { glob } from 'node:fs/promises';

/**
 * The role-name bypass exists in exactly one place.
 *
 * The constitution allows one check on a role *name* in the whole backend —
 * PermissionGuard letting SUPER_ADMIN through, so the school can recover when
 * its permissions are misconfigured. Everything else authorizes by permission.
 *
 * This is not a style rule. `ProcessApprovalUseCase` had a second copy:
 *
 *     roleCodes.includes(approverRoleCode) || roleCodes.includes('SUPER_ADMIN')
 *
 * It looked harmless and read like the guard, and that is the problem — the
 * copy does not move when the original does. The ADMIN bypass was removed from
 * PermissionGuard in ADR-0011 and this line kept working, silently granting a
 * signature the workflow never gave it. A copy of a rule is a rule that will
 * one day disagree with itself, and the disagreement is invisible: an approval
 * that should have been refused simply succeeds.
 *
 * The allowlist below is the audit. Every entry names a file and why its
 * mention of SUPER_ADMIN is not an authorization bypass; adding one is a
 * deliberate edit that shows up in review, which is the whole point.
 */

const SRC = join(process.cwd(), 'src');

/**
 * Files permitted to name SUPER_ADMIN, each with the reason.
 *
 * Two categories, neither of which grants access to an operation:
 *
 * - **the bypass itself**, in the guard, where the constitution puts it;
 * - **protecting the role from being seen or edited** — hiding SUPER_ADMIN
 *   from a role list, or refusing to modify it. These read the caller's roles,
 *   but to *withhold* something rather than to grant it, so drift makes the
 *   system stricter, never more permissive.
 */
const ALLOWED = new Map<string, string>([
  [
    'platform/access-control/permission/guards/permission.guard.ts',
    'The bypass itself. The one sanctioned role-name check (ADR-0011).',
  ],
  [
    'platform/access-control/role/constants/structural-roles.constants.ts',
    'Declares the role so bootstrap can create it. Names it, decides nothing.',
  ],
  [
    'platform/access-control/role/use-cases/update-role.use-case.ts',
    'Refuses to modify the SUPER_ADMIN role. Withholds, never grants.',
  ],
  [
    'platform/access-control/role/use-cases/get-roles.use-case.ts',
    'Hides the SUPER_ADMIN role from role lists it does not belong in.',
  ],
  [
    'platform/access-control/role/use-cases/get-role-by-id.use-case.ts',
    'Same visibility rule, for a single role.',
  ],
  [
    'platform/access-control/role/use-cases/assign-role-to-user.use-case.ts',
    'Stops a non-super-admin handing out the SUPER_ADMIN role.',
  ],
  [
    'platform/access-control/role/infrastructure/persistence/prisma-role.repository.ts',
    'Applies that visibility rule as a query predicate.',
  ],
  [
    'platform/access-control/permission/infrastructure/persistence/prisma-permission.repository.ts',
    'Same, for the permissions the role list exposes.',
  ],
]);

async function sourceFiles(): Promise<string[]> {
  const files: string[] = [];
  for await (const entry of glob('**/*.ts', { cwd: SRC })) {
    if (!entry.endsWith('.spec.ts')) files.push(entry.replace(/\\/g, '/'));
  }
  return files;
}

describe('the role-name bypass is not copied (ADR-0011)', () => {
  let sources: { path: string; text: string }[];

  beforeAll(async () => {
    const files = await sourceFiles();
    sources = await Promise.all(
      files.map(async (path) => ({
        path,
        text: await readFile(join(SRC, path), 'utf8'),
      })),
    );
  }, 60_000);

  it('finds source files to check', () => {
    // Guards the test itself: an empty sweep would pass everything below.
    expect(sources.length).toBeGreaterThan(200);
  });

  it('names SUPER_ADMIN only where the allowlist accounts for it', () => {
    // Comments explaining the rule are allowed to name it; code is not.
    const offenders = sources
      .filter((source) => !ALLOWED.has(source.path))
      .filter((source) =>
        source.text
          .split('\n')
          .filter((line) => !/^\s*(\/\/|\*|\/\*)/.test(line))
          .some((line) => line.includes('SUPER_ADMIN')),
      )
      .map((source) => source.path);

    expect(offenders).toEqual([]);
  });

  /**
   * The allowlist is a claim about files that exist. A renamed or deleted file
   * leaves an entry that silently permits nothing, and the next copy of the
   * bypass lands somewhere the list no longer covers.
   */
  it('allows nothing that has since moved', () => {
    const paths = new Set(sources.map((source) => source.path));
    const stale = [...ALLOWED.keys()].filter((path) => !paths.has(path));

    expect(stale).toEqual([]);
  });

  /**
   * The guard is where the bypass belongs, so its absence would mean the
   * break-glass path was removed without amending ADR-0011 — the opposite
   * failure, and just as worth catching.
   */
  it('keeps the bypass in the guard', () => {
    const guard = sources.find(
      (source) =>
        source.path ===
        'platform/access-control/permission/guards/permission.guard.ts',
    );

    expect(guard?.text).toContain("const SUPER_ADMIN_ROLE = 'SUPER_ADMIN'");
    expect(guard?.text).toContain('roleCodes.includes(SUPER_ADMIN_ROLE)');
  });
});
