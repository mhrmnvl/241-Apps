import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { StudentAddressRepository } from '../repositories/student-address.repository.js';
import { StudentRepository } from '../index.js';

@Injectable()
export class RemoveStudentAddressUseCase {
  private readonly logger = new Logger(RemoveStudentAddressUseCase.name);

  constructor(
    private readonly repo: StudentRepository,
    private readonly addressRepo: StudentAddressRepository,
  ) {}

  async execute(studentId: string, addressId: string): Promise<void> {
    const student = await this.repo.findById(studentId);
    if (!student)
      throw new NotFoundException(`Student with ID ${studentId} not found`);

    const address = await this.addressRepo.findOne(studentId, addressId);
    if (!address)
      throw new NotFoundException(
        `Address with ID ${addressId} not found for this student`,
      );

    await this.addressRepo.remove(addressId);
    this.logger.log(`Address ${addressId} removed from student ${studentId}`);
  }
}
