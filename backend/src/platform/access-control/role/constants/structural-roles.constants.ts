/**
 * The roles that must exist for the deployment to work, and must not be
 * deleted.
 *
 * Almost all of them are here because the code resolves them by name — delete
 * one and the operation that looks it up breaks, far from the role screen where
 * the deletion happened. `ADMIN` is the exception, and `requiredBy` says so
 * rather than inventing a file: it is kept because the school's setup is built
 * on it, not because anything in `src/` names it.
 *
 * This is the one source of truth for that fact. It used to be spread across
 * three places that could disagree — the IAM seed decided which roles were
 * `isSystem`, a migration repaired the ones it had got wrong, and a sweep read
 * the seed to check the code. Nothing tied them together, and the seed had
 * TEACHER and STUDENT marked deletable while `prisma-teacher.writer.ts` and
 * `prisma-student.writer.ts` resolved exactly those codes.
 *
 * Treated the same way as the permission catalogue, and for the same reason:
 * both are part of the code's contract rather than data the school owns, so
 * both are defined here and ensured at bootstrap. Production is populated
 * through the UI and never runs a seed, and a role that does not exist is not
 * an error there — `AccountProvisioningService` used to skip it silently, which
 * created teachers with no role at all who could sign in and see nothing.
 *
 * What is ensured is that the role *exists*. What it may do stays the school's
 * decision, made on the role screen: bootstrapping a role grants no
 * permissions, and should not.
 */
export interface StructuralRole {
  code: string;
  name: string;
  description: string;
  /**
   * Why it must exist. Normally the file that resolves it by name, so a reader
   * can check the claim against the code — and where no file does, that is what
   * this must say. A reason nobody can verify is worse than none: the entry
   * looks load-bearing and nothing tells the next reader it is not.
   */
  requiredBy: string;
}

export const STRUCTURAL_ROLES: StructuralRole[] = [
  {
    code: 'SUPER_ADMIN',
    name: 'Super Admin',
    description: 'Platform Super Admin',
    requiredBy: 'PermissionGuard — the break-glass bypass',
  },
  {
    code: 'ADMIN',
    name: 'Administrator',
    description: 'Institution Administrator',
    // The one entry no file resolves. It said "PermissionGuard — bypass except
    // exempt prefixes" until 2026-08-15, which ADR-0011 had already deleted:
    // an unverifiable claim in the file whose whole job is to be checkable.
    //
    // Kept because the school's arrangement is built on it. The per-application
    // administrators — ADMIN_INVENTARIS, ADMIN_AKADEMIK, and so on — are roles
    // the school creates and narrows itself; this one is the person who runs
    // all of them, and it must be there to be granted to.
    //
    // Like every entry here, bootstrapping it grants nothing. What it may do is
    // decided on the role screen, and the platform keys — roles, permissions,
    // users, sessions — are the grants to think twice about: an administrator
    // holding those can hand themselves every application, which makes the
    // separation decorative.
    requiredBy: 'No code path — the school-wide administrator role',
  },
  {
    code: 'TEACHER',
    name: 'Teacher',
    description: 'Institution Teacher',
    requiredBy: 'prisma-teacher.writer.ts — provisioning a teacher account',
  },
  {
    code: 'STUDENT',
    name: 'Student',
    description: 'Institution Student',
    requiredBy:
      'prisma-student.writer.ts, prisma-admission-application.repository.ts',
  },
  {
    code: 'APPLICANT',
    name: 'Pendaftar',
    description: 'Admission Applicant',
    requiredBy: 'prisma-admission-applicant.repository.ts — registration',
  },
];

const STRUCTURAL_CODES = new Set(STRUCTURAL_ROLES.map((role) => role.code));

/**
 * Whether a role is one the code depends on.
 *
 * Deletion checks this *as well as* `isSystem`, not instead of it. The flag is
 * data, and data can be created wrong — a role made through the role screen is
 * always `isSystem: false`, so a TEACHER created that way would otherwise be
 * deletable no matter what the seed or a migration had done elsewhere.
 */
export function isStructuralRole(code: string): boolean {
  return STRUCTURAL_CODES.has(code);
}
