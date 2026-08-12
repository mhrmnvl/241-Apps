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
