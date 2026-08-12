import { Prisma } from '@prisma/client';
import { USER_REF_SELECT } from '../../../../shared/domain/prisma-selects.js';

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

export const USER_DETAIL_SELECT = {
  id: true,
  identifier: true,
  userRoles: {
    include: {
      role: {
        include: {
          rolePermissions: {
            include: { permission: true },
          },
        },
      },
    },
  },
  profile: { include: PROFILE_INCLUDE },
  teacher: {
    include: {
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
        orderBy: [
          { isPrimary: 'desc' as const },
          { hireDate: 'desc' as const },
        ],
      },
      teachingAssignments: {
        where: { deletedAt: null },
        include: { subject: true },
      },
    },
  },
  student: {
    include: {
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
    },
  },
} satisfies Prisma.UserSelect;

export type UserDetail = Prisma.UserGetPayload<{
  select: typeof USER_DETAIL_SELECT;
}>;

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
