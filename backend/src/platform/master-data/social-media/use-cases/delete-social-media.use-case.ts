import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SchoolUnitSocialMediaRepository } from '../../../school-unit/index.js';
import { ProfileSocialMediaRepository } from '../../../profile/index.js';
import { ISocialMediaRepository } from '../interfaces/social-media-repository.interface.js';

@Injectable()
export class DeleteSocialMediaUseCase {
  constructor(
    private readonly repository: ISocialMediaRepository,
    private readonly schoolUnitSocialMediaRepository: SchoolUnitSocialMediaRepository,
    private readonly profileSocialMediaRepository: ProfileSocialMediaRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const [platform, usageSchoolUnit, usageProfile] = await Promise.all([
      this.repository.findById(id),
      this.schoolUnitSocialMediaRepository.countByPlatformId(id),
      this.profileSocialMediaRepository.countByPlatformId(id),
    ]);

    if (!platform)
      throw new NotFoundException(`Platform with ID ${id} not found`);

    if (usageSchoolUnit > 0 || usageProfile > 0)
      throw new ConflictException(
        'Cannot delete platform that is still in use by school units or profiles',
      );

    await this.repository.remove(id);
  }
}
