import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateStudentEnrollmentDto } from '../dto/request/create-student-enrollment.dto.js';
import { IEnrollmentRepository } from '../domain/interfaces/enrollment-repository.interface.js';
import { IClassroomRepository } from '../../classroom/domain/interfaces/classroom-repository.interface.js';

@Injectable()
export class CreateStudentEnrollmentUseCase {
  constructor(
    private readonly enrollmentRepository: IEnrollmentRepository,
    private readonly classroomRepository: IClassroomRepository,
  ) {}

  async execute(dto: CreateStudentEnrollmentDto) {
    const classroom = await this.classroomRepository.findById(dto.classroomId);

    if (classroom && classroom.capacity > 0) {
      const activeCount =
        await this.enrollmentRepository.countActiveByClassroomAndSemester(
          dto.classroomId,
          dto.semesterId,
        );

      if (activeCount >= classroom.capacity) {
        throw new BadRequestException(
          `Classroom capacity limit of ${classroom.capacity} reached`,
        );
      }
    }

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

    return this.enrollmentRepository.create(dto);
  }
}
