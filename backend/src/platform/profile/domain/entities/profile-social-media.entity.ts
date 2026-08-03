import type { NamedRef } from '../../../../shared/domain/entities/index.js';

export interface ProfileSocialMediaEntity {
  id: string;
  socialMediaId: string;
  profileId: string;
  username?: string | null;
  deletedAt?: Date | null;
}

export interface ProfileSocialMediaWithDetails extends ProfileSocialMediaEntity {
  socialMedia?: NamedRef;
  profile?: { id: string; userId: string; name: string };
}
