/**
 * The roles the code resolves by name, and therefore cannot run without.
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
  /** Where the code resolves it, so a reader can check the claim. */
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
    requiredBy: 'PermissionGuard — bypass except exempt prefixes',
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
