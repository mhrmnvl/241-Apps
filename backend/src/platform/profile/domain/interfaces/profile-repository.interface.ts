import {
  ProfileEntity,
  ProfileUpdateInput,
} from '../entities/profile.entity.js';
import {
  ProfileWithDetails,
  UserDetail,
  ProfileWithSocialMedias,
} from '../entities/profile.entity.js';

export type { ProfileWithDetails, UserDetail, ProfileWithSocialMedias };

export abstract class IProfileRepository {
  abstract findByUserId(userId: string): Promise<ProfileWithDetails | null>;
  abstract findDetailByUserId(userId: string): Promise<UserDetail | null>;
  abstract findByNik(
    nik: string,
    excludeUserId?: string,
  ): Promise<ProfileEntity | null>;
  abstract findByEmail(
    email: string,
    excludeUserId?: string,
  ): Promise<ProfileEntity | null>;

  abstract findByPhone(
    phone: string,
    excludeUserId?: string,
  ): Promise<ProfileEntity | null>;

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
    dto: ProfileUpdateInput,
  ): Promise<ProfileWithDetails>;
}
