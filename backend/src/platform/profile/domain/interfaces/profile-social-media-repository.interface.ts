import { ProfileSocialMediaEntity } from '../entities/profile-social-media.entity.js';
import { ProfileSocialMediaWithDetails } from '../entities/profile-social-media.entity.js';

export type { ProfileSocialMediaWithDetails };

export abstract class IProfileSocialMediaRepository {
  abstract findAllByProfileId(
    profileId: string,
  ): Promise<ProfileSocialMediaWithDetails[]>;

  abstract findByIdAndProfile(
    id: string,
    profileId: string,
  ): Promise<ProfileSocialMediaEntity | null>;

  abstract findByPlatformAndProfile(
    socialMediaId: string,
    profileId: string,
  ): Promise<ProfileSocialMediaEntity | null>;

  abstract create(
    profileId: string,
    dto: { socialMediaId: string; username?: string | null },
  ): Promise<ProfileSocialMediaWithDetails>;

  abstract update(
    id: string,
    dto: { username?: string | null },
  ): Promise<ProfileSocialMediaWithDetails>;

  abstract remove(id: string): Promise<ProfileSocialMediaEntity>;
  abstract countByPlatformId(socialMediaId: string): Promise<number>;
}
