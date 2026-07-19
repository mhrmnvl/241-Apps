import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateSchoolUnitSocialMediaDto,
  UpdateSchoolUnitSocialMediaDto,
} from '../dto/school-unit-social-media.dto.js';
import { SchoolUnitSocialMediaRepository } from '../repositories/school-unit-social-media.repository.js';
import { SchoolUnitRepository } from '../repositories/school-unit.repository.js';

@Injectable()
export class SchoolUnitSocialMediaUseCase {
  private readonly logger = new Logger(SchoolUnitSocialMediaUseCase.name);

  constructor(
    private readonly schoolUnitsRepo: SchoolUnitRepository,
    private readonly repo: SchoolUnitSocialMediaRepository,
  ) {}

  async findAll() {
    await this.requireSchoolUnit();
    return this.repo.findAll();
  }

  async create(dto: CreateSchoolUnitSocialMediaDto) {
    await this.requireSchoolUnit();

    const existing = await this.repo.findByPlatform(dto.socialMediaId);
    if (existing) {
      throw new ConflictException(
        `Platform ${dto.socialMediaId} is already linked to this school unit`,
      );
    }

    const socialMedia = await this.repo.create(dto);
    this.logger.log(`Social media added: platform ${dto.socialMediaId}`);
    return socialMedia;
  }

  async update(id: string, dto: UpdateSchoolUnitSocialMediaDto) {
    await this.requireSchoolUnit();
    const socialMedia = await this.repo.findById(id);
    if (!socialMedia) {
      throw new NotFoundException(`Social media with ID ${id} not found`);
    }

    return this.repo.update(id, dto);
  }

  async remove(id: string): Promise<void> {
    await this.requireSchoolUnit();
    const socialMedia = await this.repo.findById(id);
    if (!socialMedia) {
      throw new NotFoundException(`Social media with ID ${id} not found`);
    }

    await this.repo.remove(id);
    this.logger.log(`Social media ${id} removed`);
  }

  private async requireSchoolUnit() {
    const schoolUnit = await this.schoolUnitsRepo.findFirst();
    if (!schoolUnit) {
      throw new NotFoundException('School unit has not been set up yet');
    }
    return schoolUnit;
  }
}
