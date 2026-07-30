import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  Address,
  IStudentRepository,
} from '../domain/interfaces/student-repository.interface.js';
import { CreateAddressDto } from '../../../shared/dto/address.dto.js';
import { StudentAddressRepository } from '../repositories/student-address.repository.js';
import { StudentRepository } from '../index.js';

@Injectable()
export class AddStudentAddressUseCase {
  private readonly logger = new Logger(AddStudentAddressUseCase.name);

  constructor(
    private readonly repository: StudentRepository,
    private readonly addressRepository: StudentAddressRepository,
  ) {}

  async execute(studentId: string, dto: CreateAddressDto): Promise<Address> {
    const student = await this.repository.findById(studentId);
    if (!student)
      throw new NotFoundException(`Student with ID ${studentId} not found`);

    if (dto.isPrimary) await this.addressRepository.clearPrimary(studentId);

    const address = await this.addressRepository.create(studentId, dto);
    this.logger.log(`Address added to student ${studentId}`);
    return address;
  }
}
