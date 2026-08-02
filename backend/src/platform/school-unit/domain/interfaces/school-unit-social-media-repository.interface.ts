import { SchoolUnitSocialMediaEntity } from '../entities/school-unit-social-media.entity.js';

export abstract class ISchoolUnitSocialMediaRepository {
  abstract findAllBySchoolUnitId(
    schoolUnitId: string,
  ): Promise<SchoolUnitSocialMediaEntity[]>;
  abstract findById(id: string): Promise<SchoolUnitSocialMediaEntity | null>;
  abstract create(dto: {
    schoolUnitId: string;
    socialMediaId: string;
    username?: string | null;
  }): Promise<SchoolUnitSocialMediaEntity>;
  abstract update(
    id: string,
    dto: { username?: string | null },
  ): Promise<SchoolUnitSocialMediaEntity>;
  abstract remove(id: string): Promise<SchoolUnitSocialMediaEntity>;
  abstract countByPlatformId(socialMediaId: string): Promise<number>;
}
