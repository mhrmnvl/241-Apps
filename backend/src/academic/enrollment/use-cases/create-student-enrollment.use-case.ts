import { ConflictException, Injectable } from '@nestjs/common';
import { CreateStudentEnrollmentDto } from '../dto/request/create-student-enrollment.dto.js';
import { IEnrollmentRepository } from '../domain/interfaces/enrollment-repository.interface.js';

@Injectable()
export class CreateStudentEnrollmentUseCase {
  constructor(private readonly repo: IEnrollmentRepository) {}
  async execute(dto: CreateStudentEnrollmentDto) {
    const dup = await this.repo.findDuplicate(dto.studentId, dto.semesterId);
    if (dup) {
      throw new ConflictException(
        'Student is already enrolled in this semester',
      );
    }

    const softDeleted = await this.repo.findSoftDeleted(
      dto.studentId,
      dto.semesterId,
    );
    if (softDeleted) {
      return this.repo.restore(softDeleted.id, {
        classroomId: dto.classroomId,
      });
    }

    return this.repo.create(dto);
  }
}
