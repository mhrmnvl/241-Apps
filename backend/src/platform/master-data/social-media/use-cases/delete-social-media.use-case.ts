import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ISchoolUnitSocialMediaRepository } from '../../../school-unit/domain/interfaces/school-unit-social-media-repository.interface.js';
import { IProfileSocialMediaRepository } from '../../../profile/domain/interfaces/profile-social-media-repository.interface.js';
import { ISocialMediaRepository } from '../domain/interfaces/social-media-repository.interface.js';

@Injectable()
export class DeleteSocialMediaUseCase {
  constructor(
    private readonly socialMediaRepository: ISocialMediaRepository,
    private readonly schoolUnitSocialMediaRepository: ISchoolUnitSocialMediaRepository,
    private readonly profileSocialMediaRepository: IProfileSocialMediaRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const [platform, usageSchoolUnit, usageProfile] = await Promise.all([
      this.socialMediaRepository.findById(id),
      this.schoolUnitSocialMediaRepository.countByPlatformId(id),
      this.profileSocialMediaRepository.countByPlatformId(id),
    ]);

    if (!platform)
      throw new NotFoundException(`Platform with ID ${id} not found`);

    if (usageSchoolUnit > 0 || usageProfile > 0)
      throw new ConflictException(
        'Cannot delete platform that is still in use by school units or profiles',
      );

    await this.socialMediaRepository.remove(id);
  }
}
