import { ConflictException, Injectable } from '@nestjs/common';
import { CreateStudentEnrollmentDto } from '../dto/request/create-student-enrollment.dto.js';
import { IEnrollmentRepository } from '../domain/interfaces/enrollment-repository.interface.js';
import { ClassroomCapacityService } from '../services/classroom-capacity.service.js';

@Injectable()
export class CreateStudentEnrollmentUseCase {
  constructor(
    private readonly enrollmentRepository: IEnrollmentRepository,
    private readonly classroomCapacity: ClassroomCapacityService,
  ) {}

  async execute(dto: CreateStudentEnrollmentDto) {
    await this.classroomCapacity.assertRoomFor({
      classroomId: dto.classroomId,
      semesterId: dto.semesterId,
      incoming: 1,
    });

    const dup = await this.enrollmentRepository.findDuplicate(
      dto.studentId,
      dto.semesterId,
    );
    if (dup) {
      throw new ConflictException(
        'Student is already enrolled in this semester',
      );
    }

    const softDeleted = await this.enrollmentRepository.findSoftDeleted(
      dto.studentId,
      dto.semesterId,
    );
    if (softDeleted) {
      return this.enrollmentRepository.restore(softDeleted.id, {
        classroomId: dto.classroomId,
      });
    }

    // `status` is not part of the create DTO — a new enrolment always starts
    // ACTIVE, and the repository applies that default.
    return this.enrollmentRepository.create({
      studentId: dto.studentId,
      classroomId: dto.classroomId,
      semesterId: dto.semesterId,
    });
  }
}
