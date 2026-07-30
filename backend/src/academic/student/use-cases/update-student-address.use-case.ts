import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Address } from '../domain/interfaces/student-repository.interface.js';
import { UpdateAddressDto } from '../../../shared/dto/address.dto.js';
import { StudentAddressRepository } from '../repositories/student-address.repository.js';
import { StudentRepository } from '../index.js';

@Injectable()
export class UpdateStudentAddressUseCase {
  private readonly logger = new Logger(UpdateStudentAddressUseCase.name);

  constructor(
    private readonly repository: StudentRepository,
    private readonly addressRepository: StudentAddressRepository,
  ) {}

  async execute(
    studentId: string,
    addressId: string,
    dto: UpdateAddressDto,
  ): Promise<Address> {
    const student = await this.repository.findById(studentId);
    if (!student)
      throw new NotFoundException(`Student with ID ${studentId} not found`);

    const address = await this.addressRepository.findOne(studentId, addressId);
    if (!address)
      throw new NotFoundException(
        `Address with ID ${addressId} not found for this student`,
      );

    if (dto.isPrimary)
      await this.addressRepository.clearPrimaryExclude(studentId, addressId);

    const updated = await this.addressRepository.update(addressId, dto);
    this.logger.log(`Address ${addressId} updated for student ${studentId}`);
    return updated;
  }
}
