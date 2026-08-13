import { Prisma } from '@prisma/client';
import {
  USER_REF_SELECT,
  USER_ROLES_FOR_AUTHZ_SELECT,
} from '../../../../shared/domain/prisma-selects.js';

export const PROFILE_INCLUDE = {
  socialMedias: {
    where: { deletedAt: null },
    include: { socialMedia: true },
  },
  achievements: {
    where: { deletedAt: null },
    include: { type: true },
  },
  scholarships: { where: { deletedAt: null } },
  educationalHistories: { where: { deletedAt: null } },
  religion: true,
  bloodType: true,
  avatarFile: true,
} satisfies Prisma.ProfileInclude;

export type ProfileWithDetails = Prisma.ProfileGetPayload<{
  include: typeof PROFILE_INCLUDE;
}>;

/**
 * Identity, roles and the person — what every profile request needs.
 *
 * `teacher` and `student` are existence probes, not the branches themselves.
 * A user is one or the other, and reading both subtrees for everyone meant a
 * teacher's profile request also walked enrolments, classrooms, homeroom
 * supervisors and parents to find nothing there. Which branch to run is
 * decided from these two ids; see `findDetailByUserId`.
 */
export const USER_IDENTITY_SELECT = {
  id: true,
  identifier: true,
  // Codes only. The frontend's own contract for this branch is
  // `rolePermissions?: { permission: { code: string } }[]`; `permission: true`
  // was sending six columns per row, which for a member of staff is 60 KB of
  // the 61 KB this endpoint returns.
  userRoles: USER_ROLES_FOR_AUTHZ_SELECT,
  profile: { include: PROFILE_INCLUDE },
  teacher: { select: { id: true } },
  student: { select: { id: true } },
} satisfies Prisma.UserSelect;

export const TEACHER_DETAIL_INCLUDE = {
  addresses: { where: { deletedAt: null } },
  employmentType: true,
  teacherPositions: {
    where: { deletedAt: null },
    include: {
      position: {
        include: {
          category: true,
        },
      },
    },
    orderBy: [{ isPrimary: 'desc' as const }, { hireDate: 'desc' as const }],
  },
  teachingAssignments: {
    where: { deletedAt: null },
    include: { subject: true },
  },
} satisfies Prisma.TeacherInclude;

export const STUDENT_DETAIL_INCLUDE = {
  addresses: { where: { deletedAt: null } },
  enrollments: {
    where: { deletedAt: null },
    include: {
      classroom: {
        include: {
          grade: true,
          // The homeroom teacher, of whom the screen shows a name.
          //
          // This branch used to read the teacher's `User` with an `include`,
          // which returns every scalar of that row — `passwordHash` among
          // them — and `GetProfileUseCase` spreads the row it is given
          // straight into the response. A student asking for their own
          // profile was answered with their homeroom teacher's bcrypt hash.
          classroomSupervisors: {
            where: { deletedAt: null },
            select: {
              semesterId: true,
              teacher: {
                select: {
                  id: true,
                  userId: true,
                  user: USER_REF_SELECT,
                },
              },
            },
          },
        },
      },
      semester: { include: { academicYear: true } },
    },
    orderBy: { enrolledAt: 'desc' as const },
  },
  parents: {
    where: { deletedAt: null },
    include: {
      parent: {
        include: {
          occupation: true,
          education: true,
          addresses: { where: { deletedAt: null } },
        },
      },
    },
  },
} satisfies Prisma.StudentInclude;

type UserIdentity = Prisma.UserGetPayload<{
  select: typeof USER_IDENTITY_SELECT;
}>;

export type TeacherDetail = Prisma.TeacherGetPayload<{
  include: typeof TEACHER_DETAIL_INCLUDE;
}>;

export type StudentDetail = Prisma.StudentGetPayload<{
  include: typeof STUDENT_DETAIL_INCLUDE;
}>;

/**
 * The composed row. The two branch keys are replaced, not added, so the
 * response keeps the shape and the key order it had when this was one query.
 */
export type UserDetail = Omit<UserIdentity, 'teacher' | 'student'> & {
  teacher: TeacherDetail | null;
  student: StudentDetail | null;
};

export const PROFILE_WITH_SOCIAL_MEDIAS_INCLUDE = {
  user: {
    select: {
      id: true,
      identifier: true,
      isActive: true,
      userRoles: {
        include: {
          role: true,
        },
      },
    },
  },
  socialMedias: {
    where: { deletedAt: null },
    include: { socialMedia: true },
  },
} satisfies Prisma.ProfileInclude;

export type ProfileWithSocialMedias = Prisma.ProfileGetPayload<{
  include: typeof PROFILE_WITH_SOCIAL_MEDIAS_INCLUDE;
}>;
