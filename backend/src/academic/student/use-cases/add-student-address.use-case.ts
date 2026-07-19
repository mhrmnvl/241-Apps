import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Address } from '@prisma/client';
import { CreateAddressDto } from '../../../shared/dto/address.dto.js';
import { StudentAddressRepository } from '../repositories/student-address.repository.js';
import { StudentRepository } from '../index.js';

@Injectable()
export class AddStudentAddressUseCase {
  private readonly logger = new Logger(AddStudentAddressUseCase.name);

  constructor(
    private readonly repo: StudentRepository,
    private readonly addressRepo: StudentAddressRepository,
  ) {}

  async execute(studentId: string, dto: CreateAddressDto): Promise<Address> {
    const student = await this.repo.findById(studentId);
    if (!student)
      throw new NotFoundException(`Student with ID ${studentId} not found`);

    if (dto.isPrimary) await this.addressRepo.clearPrimary(studentId);

    const address = await this.addressRepo.create(studentId, dto);
    this.logger.log(`Address added to student ${studentId}`);
    return address;
  }
}
