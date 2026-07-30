import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateAddressDto,
  UpdateAddressDto,
} from '../../../shared/dto/address.dto.js';
import { SchoolUnitRepository } from '../repositories/school-unit.repository.js';
import { SchoolUnitAddressRepository } from '../repositories/school-unit-address.repository.js';

@Injectable()
export class SchoolUnitAddressUseCase {
  private readonly logger = new Logger(SchoolUnitAddressUseCase.name);

  constructor(
    private readonly schoolUnitRepository: SchoolUnitRepository,
    private readonly repository: SchoolUnitAddressRepository,
  ) {}

  async getAddress() {
    return this.repository.find();
  }

  async setAddress(dto: CreateAddressDto) {
    const schoolUnit = await this.requireSchoolUnit();
    const existing = await this.repository.find();
    if (existing) {
      throw new ConflictException(
        'School unit address already exists. Use PATCH to update.',
      );
    }

    const address = await this.repository.create(dto, schoolUnit.id);
    this.logger.log(`School unit address set`);
    return address;
  }

  async updateAddress(dto: UpdateAddressDto) {
    await this.requireSchoolUnit();
    const existing = await this.repository.find();
    if (!existing) {
      throw new NotFoundException('School unit address has not been set yet');
    }

    const updated = await this.repository.update(existing.id, dto);
    this.logger.log(`School unit address updated`);
    return updated;
  }

  async removeAddress(): Promise<void> {
    await this.requireSchoolUnit();
    const existing = await this.repository.find();
    if (!existing) {
      throw new NotFoundException('School unit address has not been set yet');
    }

    await this.repository.remove(existing.id);
    this.logger.log(`School unit address removed`);
  }

  private async requireSchoolUnit() {
    const schoolUnit = await this.schoolUnitRepository.findFirst();
    if (!schoolUnit) {
      throw new NotFoundException('School unit has not been set up yet');
    }
    return schoolUnit;
  }
}
