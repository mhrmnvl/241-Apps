import { Injectable, Logger } from '@nestjs/common';
import { AddressEntity } from '../../../shared/domain/entities/address.entity.js';
import { UpdateAddressDto } from '../../../shared/dto/address.dto.js';
import { IStudentAddressRepository } from '../domain/interfaces/student-address-repository.interface.js';
import { IStudentRepository } from '../index.js';
import {
  StudentAddressNotFoundException,
  StudentNotFoundException,
} from '../domain/exceptions/index.js';

@Injectable()
export class UpdateStudentAddressUseCase {
  private readonly logger = new Logger(UpdateStudentAddressUseCase.name);

  constructor(
    private readonly studentRepository: IStudentRepository,
    private readonly addressRepository: IStudentAddressRepository,
  ) {}

  async execute(
    studentId: string,
    addressId: string,
    dto: UpdateAddressDto,
  ): Promise<AddressEntity> {
    const student = await this.studentRepository.findById(studentId);
    if (!student) throw new StudentNotFoundException(studentId);

    const address = await this.addressRepository.findOne(studentId, addressId);
    if (!address) throw new StudentAddressNotFoundException(addressId);

    if (dto.isPrimary)
      await this.addressRepository.clearPrimaryExclude(studentId, addressId);

    const updated = await this.addressRepository.update(addressId, dto);
    this.logger.log(`Address ${addressId} updated for student ${studentId}`);
    return updated;
  }
}
