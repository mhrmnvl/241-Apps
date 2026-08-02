import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  Address,
  IStudentRepository,
} from '../domain/interfaces/student-repository.interface.js';
import { CreateAddressDto } from '../../../shared/dto/address.dto.js';
import { IStudentAddressRepository } from '../domain/interfaces/student-address-repository.interface.js';

@Injectable()
export class AddStudentAddressUseCase {
  private readonly logger = new Logger(AddStudentAddressUseCase.name);

  constructor(
    private readonly studentRepository: IStudentRepository,
    private readonly addressRepository: IStudentAddressRepository,
  ) {}

  async execute(studentId: string, dto: CreateAddressDto): Promise<Address> {
    const student = await this.studentRepository.findById(studentId);
    if (!student)
      throw new NotFoundException(`Student with ID ${studentId} not found`);

    if (dto.isPrimary) await this.addressRepository.clearPrimary(studentId);

    const address = await this.addressRepository.create(studentId, dto);
    this.logger.log(`Address added to student ${studentId}`);
    return address;
  }
}
