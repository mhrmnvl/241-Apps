import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Address } from '../domain/interfaces/student-repository.interface.js';
import { IStudentAddressRepository } from '../domain/interfaces/student-address-repository.interface.js';
import { IStudentRepository, RequestUser } from '../index.js';

@Injectable()
export class GetStudentAddressesUseCase {
  constructor(
    private readonly studentRepository: IStudentRepository,
    private readonly addressRepository: IStudentAddressRepository,
  ) {}

  async execute(
    studentId: string,
    requester?: RequestUser,
  ): Promise<Address[]> {
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
