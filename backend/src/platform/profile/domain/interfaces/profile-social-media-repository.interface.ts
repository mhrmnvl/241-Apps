import { ProfileSocialMedia, Prisma } from '@prisma/client';

export const PROFILE_SOCIAL_MEDIA_INCLUDE = {
  socialMedia: true,
} satisfies Prisma.ProfileSocialMediaInclude;

export type ProfileSocialMediaWithDetails =
  Prisma.ProfileSocialMediaGetPayload<{
    include: typeof PROFILE_SOCIAL_MEDIA_INCLUDE;
  }>;

export abstract class IProfileSocialMediaRepository {
  abstract findAllByProfileId(
    profileId: string,
  ): Promise<ProfileSocialMediaWithDetails[]>;

  abstract findByIdAndProfile(
    id: string,
    profileId: string,
  ): Promise<ProfileSocialMedia | null>;

  abstract findByPlatformAndProfile(
    socialMediaId: string,
    profileId: string,
  ): Promise<ProfileSocialMedia | null>;

  abstract create(
    profileId: string,
    dto: { socialMediaId: string; username?: string | null },
  ): Promise<ProfileSocialMediaWithDetails>;

  abstract update(
    id: string,
    dto: Prisma.ProfileSocialMediaUpdateInput,
  ): Promise<ProfileSocialMediaWithDetails>;

  abstract remove(id: string): Promise<ProfileSocialMedia>;
  abstract countByPlatformId(socialMediaId: string): Promise<number>;
}
