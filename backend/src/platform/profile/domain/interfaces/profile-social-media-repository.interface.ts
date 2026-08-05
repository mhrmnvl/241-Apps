import { ProfileSocialMediaEntity } from '../entities/profile-social-media.entity.js';
import { ProfileSocialMediaWithDetails } from '../entities/profile-social-media.entity.js';

export type { ProfileSocialMediaWithDetails };

export interface CreateProfileSocialMediaRepositoryInput {
  socialMediaId: string;
  username?: string | null;
}

/** The platform itself is fixed once linked; only the handle can change. */
export interface UpdateProfileSocialMediaRepositoryInput {
  username?: string | null;
}

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
    input: CreateProfileSocialMediaRepositoryInput,
  ): Promise<ProfileSocialMediaWithDetails>;

  abstract update(
    id: string,
    input: UpdateProfileSocialMediaRepositoryInput,
  ): Promise<ProfileSocialMediaWithDetails>;

  abstract remove(id: string): Promise<ProfileSocialMediaEntity>;
  abstract countByPlatformId(socialMediaId: string): Promise<number>;
}
