import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { StudentAddressRepository } from '../repositories/student-address.repository.js';
import { StudentRepository } from '../index.js';

@Injectable()
export class RemoveStudentAddressUseCase {
  private readonly logger = new Logger(RemoveStudentAddressUseCase.name);

  constructor(
    private readonly repository: StudentRepository,
    private readonly addressRepository: StudentAddressRepository,
  ) {}

  async execute(studentId: string, addressId: string): Promise<void> {
    const student = await this.repository.findById(studentId);
    if (!student)
      throw new NotFoundException(`Student with ID ${studentId} not found`);

    const address = await this.addressRepository.findOne(studentId, addressId);
    if (!address)
      throw new NotFoundException(
        `Address with ID ${addressId} not found for this student`,
      );

    await this.addressRepository.remove(addressId);
    this.logger.log(`Address ${addressId} removed from student ${studentId}`);
  }
}
