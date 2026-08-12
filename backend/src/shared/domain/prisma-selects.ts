import { Prisma } from '@prisma/client';

/**
 * The three shapes in which a person may be read.
 *
 * A `Profile` holds sixteen columns, most of them identifying: national ID, date
 * and place of birth, email, phone, family card number, tax number, marital
 * status. Reading the whole record to draw a name carries all of that out of the
 * database on every row of every list — and quietly adds any column someone
 * defines later to every screen at once.
 *
 * So every read that reaches a profile states which of these it needs. Reading a
 * profile any other way — `profile: true`, or an inline select — is a defect.
 *
 * `satisfies Prisma.ProfileDefaultArgs` is load-bearing: it checks the fields
 * against the schema at compile time while keeping the literal type, so
 * `Prisma.<Model>GetPayload<{ include: typeof … }>` still infers exact types. A
 * plain `as const` keeps the type but skips the check, and a typo then surfaces
 * as a runtime Prisma error.
 *
 * Widening one of these shapes reaches every one of its callers. Add the field
 * at the call site that needs it instead, with a comment saying why.
 */

/**
 * A person as a label — the common case.
 *
 * Schedules, attendance, assessments, report cards, graduations, classroom
 * supervisors and structures, portal authors, presence records.
 */
export const PROFILE_NAME_SELECT = {
  select: { name: true },
} satisfies Prisma.ProfileDefaultArgs;

/**
 * A person shown with their picture.
 *
 * Carries the avatar *file*, not `avatarFileId`: the browser is given a signed,
 * time-limited URL that `withAvatarUrl` derives from the storage key. Selecting
 * the foreign key instead compiles cleanly and renders every avatar as blank.
 */
export const PROFILE_DISPLAY_SELECT = {
  select: {
    name: true,
    avatarFile: { select: { storageKey: true } },
  },
} satisfies Prisma.ProfileDefaultArgs;

/**
 * A person on a roster, where the list shows more than a name.
 *
 * Exactly three screens: the student list and the classroom enrolment list show
 * gender, and the teacher list shows gender and NIK. Not a default — anything
 * else that reaches for this shape is probably reaching for the wrong one.
 */
export const PROFILE_ROSTER_SELECT = {
  select: {
    name: true,
    gender: true,
    nik: true,
  },
} satisfies Prisma.ProfileDefaultArgs;

/**
 * A person reached through their user account.
 *
 * Narrowing the profile is not enough on its own. `user: { include: { profile } }`
 * narrows the profile and still returns **every scalar column of `User`** —
 * Prisma's `include` means "these relations *as well as* all my own fields". One
 * of those fields is `passwordHash`.
 *
 * That is not hypothetical. `GetProfileUseCase` returns `{ ...user, profile }`,
 * and the homeroom-teacher branch of the profile read reached a `User` this way,
 * so `GET /profiles/me` answered a student with their teacher's bcrypt hash.
 *
 * These three shapes carry exactly what `UserRef` declares — id, identifier,
 * isActive — and nothing else. Reaching a `User` any other way is a defect;
 * `no-user-scalar-overfetch.spec.ts` is the sweep that says so.
 */
const USER_REF_FIELDS = {
  id: true,
  identifier: true,
  isActive: true,
} satisfies Prisma.UserSelect;

/** A user account whose person is a label. */
export const USER_REF_SELECT = {
  select: { ...USER_REF_FIELDS, profile: PROFILE_NAME_SELECT },
} satisfies Prisma.UserDefaultArgs;

/** A user account whose person is drawn with their picture. */
export const USER_DISPLAY_SELECT = {
  select: { ...USER_REF_FIELDS, profile: PROFILE_DISPLAY_SELECT },
} satisfies Prisma.UserDefaultArgs;

/** A user account on a roster. */
export const USER_ROSTER_SELECT = {
  select: { ...USER_REF_FIELDS, profile: PROFILE_ROSTER_SELECT },
} satisfies Prisma.UserDefaultArgs;

/**
 * A person's roles, read as an authorisation answer.
 *
 * The identity paths ask one question of this tree — *may they do X* — and
 * answer it from `permission.code` alone. Reading it with `include` instead
 * carried every column of every permission: id, module, action, description and
 * two timestamps, none of them read.
 *
 * That is the single largest read in the system. A member of staff holds 173
 * permissions, at 348 bytes each: **60 KB of the 61 KB** that `GET /profiles/me`
 * returns is this tree, and `GET /auth/me` reads the same rows on every cold
 * start of all five applications.
 *
 * Not for the access-control screens. The role editor and the permission list
 * render `module`, `action` and `description`, so they read the whole row on
 * purpose — see `prisma-role.repository.ts` and `prisma-permission.repository.ts`.
 * This shape is for deciding, not for displaying.
 */
export const USER_ROLES_FOR_AUTHZ_SELECT = {
  select: {
    userId: true,
    roleId: true,
    role: {
      select: {
        id: true,
        code: true,
        name: true,
        rolePermissions: {
          select: { permission: { select: { code: true } } },
        },
      },
    },
  },
} satisfies Prisma.UserRoleDefaultArgs;
