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
import { ISchoolUnitRepository } from '../domain/interfaces/school-unit-repository.interface.js';
import { ISchoolUnitAddressRepository } from '../domain/interfaces/school-unit-address-repository.interface.js';

@Injectable()
export class SchoolUnitAddressUseCase {
  private readonly logger = new Logger(SchoolUnitAddressUseCase.name);

  constructor(
    private readonly schoolUnitRepository: ISchoolUnitRepository,
    private readonly schoolUnitAddressRepository: ISchoolUnitAddressRepository,
  ) {}

  async getAddress() {
    const schoolUnit = await this.requireSchoolUnit();
    return this.schoolUnitAddressRepository.findBySchoolUnitId(schoolUnit.id);
  }

  async setAddress(dto: CreateAddressDto) {
    const schoolUnit = await this.requireSchoolUnit();
    const existing = await this.schoolUnitAddressRepository.findBySchoolUnitId(
      schoolUnit.id,
    );
    if (existing) {
      throw new ConflictException(
        'School unit address already exists. Use PATCH to update.',
      );
    }

    const address = await this.schoolUnitAddressRepository.create(
      schoolUnit.id,
      dto,
    );
    this.logger.log(`School unit address set`);
    return address;
  }

  async updateAddress(dto: UpdateAddressDto) {
    const schoolUnit = await this.requireSchoolUnit();
    const existing = await this.schoolUnitAddressRepository.findBySchoolUnitId(
      schoolUnit.id,
    );
    if (!existing) {
      throw new NotFoundException('School unit address has not been set yet');
    }

    const updated = await this.schoolUnitAddressRepository.update(
      existing.id,
      dto,
    );
    this.logger.log(`School unit address updated`);
    return updated;
  }

  async removeAddress(): Promise<void> {
    const schoolUnit = await this.requireSchoolUnit();
    const existing = await this.schoolUnitAddressRepository.findBySchoolUnitId(
      schoolUnit.id,
    );
    if (!existing) {
      throw new NotFoundException('School unit address has not been set yet');
    }

    await this.schoolUnitAddressRepository.softDelete(existing.id);
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
