import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SchoolUnitSocialMediaRepository } from '../../../school-unit/index.js';
import { ProfileSocialMediaRepository } from '../../../profile/index.js';
import { ISocialMediaRepository } from '../interfaces/social-media-repository.interface.js';

@Injectable()
export class DeleteSocialMediaService {
  constructor(
    private readonly repo: ISocialMediaRepository,
    private readonly schoolUnitSocialMediaRepo: SchoolUnitSocialMediaRepository,
    private readonly profileSocialMediaRepo: ProfileSocialMediaRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const [platform, usageSchoolUnit, usageProfile] = await Promise.all([
      this.repo.findById(id),
      this.schoolUnitSocialMediaRepo.countByPlatformId(id),
      this.profileSocialMediaRepo.countByPlatformId(id),
    ]);

    if (!platform)
      throw new NotFoundException(`Platform with ID ${id} not found`);

    if (usageSchoolUnit > 0 || usageProfile > 0)
      throw new ConflictException(
        'Cannot delete platform that is still in use by school units or profiles',
      );

    await this.repo.remove(id);
  }
}
