import {
  BadRequestException,
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

/**
 * A coordinate is a pair or it is nothing.
 *
 * One half is not a place: it draws no pin, answers no distance, and there is
 * no sensible thing for a map to do with it. Refusing it here keeps that out of
 * the database, where it would otherwise sit looking like data.
 *
 * Both null is the ordinary state — most addresses are not pinned — and 0 is a
 * real coordinate, so the check is against null rather than falsiness.
 */
function assertWholeCoordinate(
  latitude: number | null,
  longitude: number | null,
): void {
  if ((latitude === null) === (longitude === null)) return;
  throw new BadRequestException(
    'Latitude and longitude must be provided together, or both left empty.',
  );
}

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

    assertWholeCoordinate(dto.latitude ?? null, dto.longitude ?? null);

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

    // Judged on the result, not on the payload. A patch carrying only
    // `latitude` over an address that already has both is a perfectly ordinary
    // request; the same patch over one that has neither leaves half a pin.
    assertWholeCoordinate(
      dto.latitude !== undefined ? dto.latitude : (existing.latitude ?? null),
      dto.longitude !== undefined
        ? dto.longitude
        : (existing.longitude ?? null),
    );

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
