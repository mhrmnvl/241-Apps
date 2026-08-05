import { Injectable, Logger } from '@nestjs/common';
import { IStudentRepository } from '../domain/interfaces/student-repository.interface.js';
import { AddressEntity } from '../../../shared/domain/entities/address.entity.js';
import { CreateAddressDto } from '../../../shared/dto/address.dto.js';
import { IStudentAddressRepository } from '../domain/interfaces/student-address-repository.interface.js';
import { StudentNotFoundException } from '../domain/exceptions/index.js';

@Injectable()
export class AddStudentAddressUseCase {
  private readonly logger = new Logger(AddStudentAddressUseCase.name);

  constructor(
    private readonly studentRepository: IStudentRepository,
    private readonly addressRepository: IStudentAddressRepository,
  ) {}

  async execute(
    studentId: string,
    dto: CreateAddressDto,
  ): Promise<AddressEntity> {
    const student = await this.studentRepository.findById(studentId);
    if (!student) throw new StudentNotFoundException(studentId);

    if (dto.isPrimary) await this.addressRepository.clearPrimary(studentId);

    const address = await this.addressRepository.create(studentId, dto);
    this.logger.log(`Address added to student ${studentId}`);
    return address;
  }
}
