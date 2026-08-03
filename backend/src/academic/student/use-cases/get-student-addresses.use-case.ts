import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AddressEntity } from '../../../shared/domain/entities/address.entity.js';
import { IStudentAddressRepository } from '../domain/interfaces/student-address-repository.interface.js';
import { IStudentRepository } from '../index.js';
import type { RequestUser } from '../../../core/types/request-user.type.js';

@Injectable()
export class GetStudentAddressesUseCase {
  constructor(
    private readonly studentRepository: IStudentRepository,
    private readonly addressRepository: IStudentAddressRepository,
  ) {}

  async execute(
    studentId: string,
    requester?: RequestUser,
  ): Promise<AddressEntity[]> {
    if (requester) {
      const isStudent = await this.studentRepository.isStudent(requester.id);
      if (isStudent) {
        const own = await this.studentRepository.findByUserId(requester.id);
        if (!own)
          throw new ForbiddenException(
            'Student account is not linked to an active student record',
          );
        if (own.id !== studentId)
          throw new ForbiddenException(
            'You can only access your own student data',
          );
      }
    }
    const student = await this.studentRepository.findById(studentId);
    if (!student)
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    return this.addressRepository.findAll(studentId);
  }
}
