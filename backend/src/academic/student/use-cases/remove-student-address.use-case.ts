import { Injectable, Logger } from '@nestjs/common';
import { IStudentAddressRepository } from '../domain/interfaces/student-address-repository.interface.js';
import { IStudentRepository } from '../index.js';
import {
  StudentAddressNotFoundException,
  StudentNotFoundException,
} from '../domain/exceptions/index.js';

@Injectable()
export class RemoveStudentAddressUseCase {
  private readonly logger = new Logger(RemoveStudentAddressUseCase.name);

  constructor(
    private readonly studentRepository: IStudentRepository,
    private readonly addressRepository: IStudentAddressRepository,
  ) {}

  async execute(studentId: string, addressId: string): Promise<void> {
    const student = await this.studentRepository.findById(studentId);
    if (!student) throw new StudentNotFoundException(studentId);

    const address = await this.addressRepository.findOne(studentId, addressId);
    if (!address) throw new StudentAddressNotFoundException(addressId);

    await this.addressRepository.remove(addressId);
    this.logger.log(`Address ${addressId} removed from student ${studentId}`);
  }
}
