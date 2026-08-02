import { Prisma } from '@prisma/client';

export const PROFILE_SOCIAL_MEDIA_INCLUDE = {
  socialMedia: true,
} satisfies Prisma.ProfileSocialMediaInclude;

export type ProfileSocialMediaWithDetails =
  Prisma.ProfileSocialMediaGetPayload<{
    include: typeof PROFILE_SOCIAL_MEDIA_INCLUDE;
  }>;
