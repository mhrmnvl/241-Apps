import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateSchoolUnitSocialMediaDto } from '../dto/request/create-school-unit-social-media.dto.js';
import { UpdateSchoolUnitSocialMediaDto } from '../dto/request/update-school-unit-social-media.dto.js';
import { ISchoolUnitRepository } from '../domain/interfaces/school-unit-repository.interface.js';
import { ISchoolUnitSocialMediaRepository } from '../domain/interfaces/school-unit-social-media-repository.interface.js';

@Injectable()
export class SchoolUnitSocialMediaUseCase {
  private readonly logger = new Logger(SchoolUnitSocialMediaUseCase.name);

  constructor(
    private readonly schoolUnitRepository: ISchoolUnitRepository,
    private readonly schoolUnitSocialMediaRepository: ISchoolUnitSocialMediaRepository,
  ) {}

  async findAll() {
    const schoolUnit = await this.requireSchoolUnit();
    return this.schoolUnitSocialMediaRepository.findAllBySchoolUnitId(
      schoolUnit.id,
    );
  }

  async create(dto: CreateSchoolUnitSocialMediaDto) {
    const schoolUnit = await this.requireSchoolUnit();

    const socialMedia = await this.schoolUnitSocialMediaRepository.create({
      schoolUnitId: schoolUnit.id,
      socialMediaId: dto.socialMediaId,
      username: dto.username,
    });
    this.logger.log(`Social media added: platform ${dto.socialMediaId}`);
    return socialMedia;
  }

  async update(id: string, dto: UpdateSchoolUnitSocialMediaDto) {
    await this.requireSchoolUnit();
    const socialMedia = await this.schoolUnitSocialMediaRepository.findById(id);
    if (!socialMedia) {
      throw new NotFoundException(`Social media with ID ${id} not found`);
    }

    return this.schoolUnitSocialMediaRepository.update(id, dto);
  }

  async remove(id: string): Promise<void> {
    await this.requireSchoolUnit();
    const socialMedia = await this.schoolUnitSocialMediaRepository.findById(id);
    if (!socialMedia) {
      throw new NotFoundException(`Social media with ID ${id} not found`);
    }

    await this.schoolUnitSocialMediaRepository.remove(id);
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
