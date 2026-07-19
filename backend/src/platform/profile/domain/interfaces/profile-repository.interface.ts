import { Profile, Prisma } from '@prisma/client';

export const PROFILE_INCLUDE = {
  socialMedias: {
    where: { deletedAt: null },
    include: { socialMedia: true },
  },
  achievements: { where: { deletedAt: null } },
  scholarships: { where: { deletedAt: null } },
  educationalHistories: { where: { deletedAt: null } },
  religion: true,
  bloodType: true,
} satisfies Prisma.ProfileInclude;

export type ProfileWithDetails = Prisma.ProfileGetPayload<{
  include: typeof PROFILE_INCLUDE;
}>;

export const USER_DETAIL_SELECT = {
  id: true,
  identifier: true,
  userRoles: {
    include: {
      role: true,
    },
  },
  profile: { include: PROFILE_INCLUDE },
  teacher: {
    include: {
      addresses: { where: { deletedAt: null } },
      teacherPositions: {
        where: { deletedAt: null },
        include: { position: true },
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
          classroom: true,
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
    include: {
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

export abstract class IProfileRepository {
  abstract findByUserId(userId: string): Promise<ProfileWithDetails | null>;
  abstract findDetailByUserId(userId: string): Promise<UserDetail | null>;
  abstract findByNik(
    nik: string,
    excludeUserId?: string,
  ): Promise<Profile | null>;
  abstract findByEmail(
    email: string,
    excludeUserId?: string,
  ): Promise<Profile | null>;

  abstract findByPhone(
    phone: string,
    excludeUserId?: string,
  ): Promise<Profile | null>;

  abstract findAllWithSocialMedias(params: {
    skip?: number;
    take?: number;
    search?: string;
    roleCode?: string;
  }): Promise<ProfileWithSocialMedias[]>;

  abstract countAllWithSocialMedias(params: {
    search?: string;
    roleCode?: string;
  }): Promise<number>;

  abstract update(
    userId: string,
    dto: Prisma.ProfileUpdateInput,
  ): Promise<ProfileWithDetails>;
}
