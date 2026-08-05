import { Injectable } from '@nestjs/common';
import { StudentEnrollmentQueryDto } from '../dto/request/student-enrollment-query.dto.js';
import { IEnrollmentRepository } from '../domain/interfaces/enrollment-repository.interface.js';

@Injectable()
export class GetStudentEnrollmentsUseCase {
  constructor(private readonly enrollmentRepository: IEnrollmentRepository) {}
  async execute(query: StudentEnrollmentQueryDto) {
    return this.enrollmentRepository.findAll({
      page: query.page,
      limit: query.limit,
      studentId: query.studentId,
      classroomId: query.classroomId,
      semesterId: query.semesterId,
      academicYearId: query.academicYearId,
      status: query.status,
    });
  }
}
