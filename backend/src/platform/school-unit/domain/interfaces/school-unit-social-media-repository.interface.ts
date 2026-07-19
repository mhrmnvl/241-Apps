import { SchoolUnitSocialMedia, Prisma } from '@prisma/client';

export const SCHOOL_UNIT_SOCIAL_MEDIA_INCLUDE = {
  socialMedia: true,
} satisfies Prisma.SchoolUnitSocialMediaInclude;

export type SchoolUnitSocialMediaWithDetails =
  Prisma.SchoolUnitSocialMediaGetPayload<{
    include: typeof SCHOOL_UNIT_SOCIAL_MEDIA_INCLUDE;
  }>;

export abstract class ISchoolUnitSocialMediaRepository {
  abstract findAll(): Promise<SchoolUnitSocialMediaWithDetails[]>;

  abstract findByPlatform(
    socialMediaId: string,
  ): Promise<SchoolUnitSocialMedia | null>;

  abstract findById(id: string): Promise<SchoolUnitSocialMedia | null>;

  abstract create(dto: {
    socialMediaId: string;
    username?: string | null;
  }): Promise<SchoolUnitSocialMediaWithDetails>;

  abstract update(
    id: string,
    dto: Prisma.SchoolUnitSocialMediaUpdateInput,
  ): Promise<SchoolUnitSocialMediaWithDetails>;

  abstract remove(id: string): Promise<SchoolUnitSocialMedia>;
  abstract countByPlatformId(socialMediaId: string): Promise<number>;
}
