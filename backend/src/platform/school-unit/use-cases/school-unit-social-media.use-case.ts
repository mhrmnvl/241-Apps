import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateSchoolUnitSocialMediaDto } from '../dto/request/create-school-unit-social-media.dto.js';
import { UpdateSchoolUnitSocialMediaDto } from '../dto/request/update-school-unit-social-media.dto.js';
import { SchoolUnitSocialMediaRepository } from '../repositories/school-unit-social-media.repository.js';
import { SchoolUnitRepository } from '../repositories/school-unit.repository.js';

@Injectable()
export class SchoolUnitSocialMediaUseCase {
  private readonly logger = new Logger(SchoolUnitSocialMediaUseCase.name);

  constructor(
    private readonly schoolUnitRepository: SchoolUnitRepository,
    private readonly repository: SchoolUnitSocialMediaRepository,
  ) {}

  async findAll() {
    await this.requireSchoolUnit();
    return this.repository.findAll();
  }

  async create(dto: CreateSchoolUnitSocialMediaDto) {
    await this.requireSchoolUnit();

    const existing = await this.repository.findByPlatform(dto.socialMediaId);
    if (existing) {
      throw new ConflictException(
        `Platform ${dto.socialMediaId} is already linked to this school unit`,
      );
    }

    const socialMedia = await this.repository.create(dto);
    this.logger.log(`Social media added: platform ${dto.socialMediaId}`);
    return socialMedia;
  }

  async update(id: string, dto: UpdateSchoolUnitSocialMediaDto) {
    await this.requireSchoolUnit();
    const socialMedia = await this.repository.findById(id);
    if (!socialMedia) {
      throw new NotFoundException(`Social media with ID ${id} not found`);
    }

    return this.repository.update(id, dto);
  }

  async remove(id: string): Promise<void> {
    await this.requireSchoolUnit();
    const socialMedia = await this.repository.findById(id);
    if (!socialMedia) {
      throw new NotFoundException(`Social media with ID ${id} not found`);
    }

    await this.repository.remove(id);
    this.logger.log(`Social media ${id} removed`);
  }

  private async requireSchoolUnit() {
    const schoolUnit = await this.schoolUnitRepository.findFirst();
    if (!schoolUnit) {
      throw new NotFoundException('School unit has not been set up yet');
    }
    return schoolUnit;
  }
}
