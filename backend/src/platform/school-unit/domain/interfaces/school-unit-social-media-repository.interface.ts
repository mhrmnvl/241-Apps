import { SchoolUnitSocialMediaEntity } from '../entities/school-unit-social-media.entity.js';

export interface CreateSchoolUnitSocialMediaRepositoryInput {
  schoolUnitId: string;
  socialMediaId: string;
  username?: string | null;
}

/** The linked platform is fixed once created; only the handle can change. */
export interface UpdateSchoolUnitSocialMediaRepositoryInput {
  username?: string | null;
}

export abstract class ISchoolUnitSocialMediaRepository {
  abstract findAllBySchoolUnitId(
    schoolUnitId: string,
  ): Promise<SchoolUnitSocialMediaEntity[]>;
  abstract findById(id: string): Promise<SchoolUnitSocialMediaEntity | null>;
  abstract create(
    input: CreateSchoolUnitSocialMediaRepositoryInput,
  ): Promise<SchoolUnitSocialMediaEntity>;
  abstract update(
    id: string,
    input: UpdateSchoolUnitSocialMediaRepositoryInput,
  ): Promise<SchoolUnitSocialMediaEntity>;
  abstract remove(id: string): Promise<SchoolUnitSocialMediaEntity>;
  abstract countByPlatformId(socialMediaId: string): Promise<number>;
}
